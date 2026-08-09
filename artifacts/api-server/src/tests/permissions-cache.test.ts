import { describe, it, expect, vi, beforeEach } from "vitest";
import { requirePermission } from "../middleware/permissions";
import { db } from "@workspace/db";
import { resolveUserPermissions } from "../lib/permissions";
import type { Request, Response, NextFunction } from "express";

// Mock @workspace/db
vi.mock("@workspace/db", () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockImplementation(() => Promise.resolve([{ id: 1, role: "barista" }])),
  };
  return {
    db: mockDb,
    usersTable: { id: "id" },
    userPermissionsTable: { userId: "userId", permissionKey: "permissionKey" },
  };
});

// Mock resolveUserPermissions
vi.mock("../lib/permissions", () => {
  return {
    resolveUserPermissions: vi.fn().mockResolvedValue(["view_pos", "create_order"]),
  };
});

describe("requirePermission Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      session: {
        save: vi.fn().mockImplementation((cb: any) => cb(null)),
      } as any,
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    nextFunction = vi.fn();
  });

  it("should return 401 if user is not authenticated", async () => {
    mockReq.session! = {
      save: vi.fn(),
    } as any; // No userId or cashierId

    const middleware = requirePermission("view_pos");
    await middleware(mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Not authenticated" });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should grant access and call next if permission is cached in session", async () => {
    mockReq.session! = {
      userId: 1,
      role: "barista",
      permissions: ["view_pos", "create_order"],
      save: vi.fn(),
    } as any;

    const middleware = requirePermission("view_pos");
    await middleware(mockReq as Request, mockRes as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("should deny access and return 403 if permission is cached but does not match required", async () => {
    mockReq.session! = {
      userId: 1,
      role: "barista",
      permissions: ["view_pos"],
      save: vi.fn(),
    } as any;

    const middleware = requirePermission("admin_settings");
    await middleware(mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Insufficient permissions: 'admin_settings' required",
      })
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should lazy load permissions from DB and save to session if cache is empty", async () => {
    mockReq.session! = {
      userId: 1,
      role: "barista",
      permissions: undefined, // Cache miss
      save: vi.fn().mockImplementation((cb: any) => cb(null)),
    } as any;

    const middleware = requirePermission("create_order");
    await middleware(mockReq as Request, mockRes as Response, nextFunction);

    // Verify DB queries and permission resolution were called
    expect(db.select).toHaveBeenCalled();
    expect(resolveUserPermissions).toHaveBeenCalledWith(1, "barista");
    
    // Verify permissions were cached back into session and saved
    expect((mockReq.session as any).permissions).toEqual(["view_pos", "create_order"]);
    expect((mockReq.session as any).save).toHaveBeenCalled();

    // Verify permission was verified and next called
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });
});
