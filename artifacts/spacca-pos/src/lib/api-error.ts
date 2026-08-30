import { ALL_PERMISSIONS } from "@workspace/api-zod";

export function parseApiError(err: any, fallbackMessage: string = "Failed to load data"): string {
  if (!err) return fallbackMessage;

  let errObj: any = null;

  if (typeof err === "string") {
    try {
      errObj = JSON.parse(err);
    } catch {
      if (err.includes("Access Denied") || err.toLowerCase().includes("permission")) {
        return err;
      }
    }
  } else if (typeof err === "object") {
    errObj = err;
  }

  if (errObj) {
    if (errObj.permission || errObj.permissionName) {
      const permKey = errObj.permission;
      const permName = errObj.permissionName || (ALL_PERMISSIONS as any)?.[permKey]?.name || permKey;
      return `Access Denied: Missing required permission '${permName}' (${permKey})`;
    }
    if (errObj.error) {
      return parseApiError(errObj.error, fallbackMessage);
    }
    if (errObj.message) {
      return parseApiError(errObj.message, fallbackMessage);
    }
  }

  const message = String(err?.message || err || "");
  if (message.includes("403") || message.toLowerCase().includes("insufficient") || message.toLowerCase().includes("permission")) {
    return message;
  }

  return message || fallbackMessage;
}

export async function handleApiResponse(res: Response): Promise<any> {
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    // plain text
  }

  if (!res.ok) {
    if (res.status === 403 || res.status === 401) {
      const permKey = json?.permission;
      const permName = json?.permissionName || (ALL_PERMISSIONS as any)?.[permKey]?.name || permKey;
      const errorMsg = json?.error || (permKey ? `Access Denied: Missing permission '${permName}' (${permKey})` : "Access Denied: Insufficient permissions");
      const err = new Error(errorMsg);
      (err as any).status = res.status;
      (err as any).permission = permKey;
      (err as any).permissionName = permName;
      throw err;
    }
    throw new Error(json?.error || text || `Request failed with status ${res.status}`);
  }

  return json;
}
