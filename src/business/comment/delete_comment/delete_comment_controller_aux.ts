import { createExpressError } from "@src/errors.js"

export function userIdExists(userId?: number): number {
  if (!userId)
    throw createExpressError(500, "req.userId does not exist")
  else
    return userId
}
