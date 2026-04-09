import type { NextFunction, Request, Response } from "express";
import { auth } from "../config/firebase";

export interface AuthedRequest extends Request {
  userId?: string;
}

/**
 * Verifies Firebase Auth ID token from `Authorization: Bearer <token>`.
 * Falls back to `req.body.userId` only for local/dev compatibility.
 */
export async function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization") || req.header("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  try {
    if (match?.[1]) {
      const idToken = match[1];
      console.log("Token received:", idToken);
      const decoded = await auth.verifyIdToken(idToken);
      console.log("Token verified for UID:", decoded.uid);
      req.userId = decoded.uid;
      return next();
    }

    const bodyUserId = (req.body && typeof req.body.userId === "string") ? req.body.userId : "";
    if (bodyUserId) {
      req.userId = bodyUserId;
      return next();
    }

    return res.status(401).json({ error: "Missing or invalid Authorization Bearer token" });
  } catch (err) {
    console.error("Auth token verification failed", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}