import { createExpressError } from "@src/errors.js"

export function userIdExists(userId?: number): void {
  if (!userId)
    throw createExpressError(500, "req.userId does not exist")
}

export function verifyUser(id?: number, userId?: number): void {
  if (userId !== id)
    throw createExpressError(500, "post doesnt belong to user")
}
