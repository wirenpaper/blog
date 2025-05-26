import { createExpressError } from "@src/errors.js"

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
