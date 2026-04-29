import { db, activityLogsTable } from "@workspace/db";
import type { Request } from "express";

export async function logActivity(
  req: Request,
  action: string,
  entityType?: string,
  entityId?: number,
  details?: any
) {
  const userId = (req.session as any).userId;
  if (!userId) return;

  try {
    await db.insert(activityLogsTable).values({
      userId,
      action,
      entityType,
      entityId,
      details: {
        ...details,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
    });
  } catch (err) {
    console.error("[logActivity] error:", err);
  }
}
