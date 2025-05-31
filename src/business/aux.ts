import { Request, Response } from "express"

import { createExpressError } from "@src/errors.js"
import { ValidationError, validationResult } from "express-validator"

export function userIdExists(userId?: number): void {
  if (!userId)
    throw createExpressError(500, "req.userId does not exist")
}

export function verifyUser(id?: number, userId?: number): void {
  if (userId !== id)
    throw createExpressError(500, "user verification failed")
}

export function verifyUserBool(id?: number, userId?: number): boolean {
  return (userId !== id)
}

export function validation(req: Request<unknown>, res: Response<unknown>): boolean {
  const errors = validationResult(req as Request)
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err: ValidationError) => (typeof err.msg === "string" ? err.msg : "Invalid input"))
      .join(", ")
    res.status(400).json({ message: errorMessages })
    return false
  }
  return true
}
