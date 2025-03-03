import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { createExpressError } from "@src/errors.js"

function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization

  if (!token) {
    // res.status(401).json({ message: "No token provided" })
    // return
    throw createExpressError(401, "No token provided")
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    // res.status(500).json({ message: "Server misconfiguration: missing JWT_SECRET" });
    // return
    throw createExpressError(500, "Server misconfiguration: missing JWT_SECRET")
  }

  jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      // res.status(401).json({ message: "Invalid token" });
      // return
      throw createExpressError(401, "Invalid token")
    }
    if (!decoded) {
      // res.status(500).json({ message: "decoded is undefined" })
      // return
      throw createExpressError(500, "Decoded is undefined")
    }

    if (typeof decoded === "string") {
      // res.status(500).json({ message: "decoded not of type JwtPayload" })
      // return
      throw createExpressError(500, "Decoded not of type JwtPayload")
    }

    if (typeof decoded.id !== "number") {
      throw createExpressError(500, "decoded.id not yielding number, error")
    }

    req.userId = decoded.id
    next()
  })

}

export default authMiddleware
