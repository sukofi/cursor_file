
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { registerOAuthRoutes } from "./_core/oauth";
import { sdk } from "./_core/sdk";
import * as db from "./db";
import type { Request, Response } from "express";
import { ONE_YEAR_MS, COOKIE_NAME } from "../shared/const";

// Mock dependencies
vi.mock("./_core/sdk", () => ({
  sdk: {
    exchangeCodeForToken: vi.fn(),
    getUserInfo: vi.fn(),
    createSessionToken: vi.fn(),
  },
}));

vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

vi.mock("./_core/cookies", () => ({
  getSessionCookieOptions: vi.fn(() => ({ secure: true, httpOnly: true })),
}));

describe("auth.login (OAuth Callback)", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let callbackHandler: (req: Request, res: Response) => Promise<void>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock Express app to capture the route handler
    const mockApp = {
      get: vi.fn((path, handler) => {
        if (path === "/api/oauth/callback") {
          callbackHandler = handler;
        }
      }),
    } as unknown as any;

    registerOAuthRoutes(mockApp);

    mockReq = {
      query: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      cookie: vi.fn(),
      redirect: vi.fn(),
    };
  });

  it("should handle successful login flow", async () => {
    // Setup request query params
    mockReq.query = { code: "test-code", state: "test-state" };

    // Setup SDK mocks
    const mockTokenResponse = { accessToken: "test-token" };
    const mockUserInfo = {
      openId: "user-123",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "google",
    };
    const mockSessionToken = "session-token-123";

    vi.mocked(sdk.exchangeCodeForToken).mockResolvedValue(mockTokenResponse as any);
    vi.mocked(sdk.getUserInfo).mockResolvedValue(mockUserInfo as any);
    vi.mocked(sdk.createSessionToken).mockResolvedValue(mockSessionToken);
    vi.mocked(db.upsertUser).mockResolvedValue(undefined);

    // Invoke the handler
    await callbackHandler(mockReq as Request, mockRes as Response);

    // Verify interactions
    expect(sdk.exchangeCodeForToken).toHaveBeenCalledWith("test-code", "test-state");
    expect(sdk.getUserInfo).toHaveBeenCalledWith("test-token");
    
    expect(db.upsertUser).toHaveBeenCalledWith({
      openId: "user-123",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "google",
      lastSignedIn: expect.any(Date),
    });

    expect(sdk.createSessionToken).toHaveBeenCalledWith("user-123", {
      name: "Test User",
      expiresInMs: ONE_YEAR_MS,
    });

    expect(mockRes.cookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      mockSessionToken,
      expect.objectContaining({
        secure: true,
        httpOnly: true,
        maxAge: ONE_YEAR_MS,
      })
    );

    expect(mockRes.redirect).toHaveBeenCalledWith(302, "/");
  });

  it("should require code and state", async () => {
    mockReq.query = { code: "test-code" }; // Missing state

    await callbackHandler(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "code and state are required" });
    expect(sdk.exchangeCodeForToken).not.toHaveBeenCalled();
  });

  it("should handle error if user info is missing openId", async () => {
    mockReq.query = { code: "test-code", state: "test-state" };

    vi.mocked(sdk.exchangeCodeForToken).mockResolvedValue({ accessToken: "test-token" } as any);
    vi.mocked(sdk.getUserInfo).mockResolvedValue({ name: "User No ID" } as any); // Missing openId

    await callbackHandler(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "openId missing from user info" });
    expect(db.upsertUser).not.toHaveBeenCalled();
  });

  it("should handle sdk errors gracefully", async () => {
    mockReq.query = { code: "test-code", state: "test-state" };

    vi.mocked(sdk.exchangeCodeForToken).mockRejectedValue(new Error("Network error"));

    await callbackHandler(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "OAuth callback failed" });
  });
});
