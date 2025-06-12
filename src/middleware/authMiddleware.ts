import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { createExpressError } from "@src/errors.js"

// eslint-disable-next-line @typescript-eslint/require-await
async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
      throw createExpressError(401, "No token provided or malformed header")
    }

    const token = authHeader.split(" ")[1]

    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw createExpressError(500, "Server misconfiguration: missing JWT_SECRET")
    }

    const decoded = jwt.verify(token, secret)

    // The only payload check we need now is for its content.
    if (typeof decoded !== "object" || typeof decoded.id !== "number") {
      throw createExpressError(401, "Invalid token payload")
    }

    req.userId = decoded.id
    next()

  } catch (error) {
    // If the error is from the JWT library, map it to a clear 401.
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createExpressError(401, "Invalid or expired token"))
    }

    // Otherwise, pass the original error along.
    next(error)
  }
}

export default authMiddleware
