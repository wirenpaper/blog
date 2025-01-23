import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization

  if (!token) {
    res.status(401).json({ message: "No token provided" })
    return
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.status(500).json({ message: "Server misconfiguration: missing JWT_SECRET" });
    return
  }

  jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      res.status(401).json({ message: "Invalid token" });
      return
    }
    if (!decoded) {
      res.status(500).json({ message: "decoded is undefined" })
      return
    }

    if (typeof decoded === "string") {
      res.status(500).json({ message: "decoded not of type JwtPayload" })
      return
    }

    if (typeof decoded.id !== "number") {
      throw Error("decoded.id not yielding number, error")
    }

    req.userId = decoded.id

    next()
  })

}

export default authMiddleware
