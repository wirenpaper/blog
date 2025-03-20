import { Router, Request } from "express"
import { UserRepository } from "@db/user/user_repository.js"
import { makeResetPasswordService } from "@business/auth/reset_password/reset_password_service.js"
import { ExpressError, isExpressError } from "@src/errors.js"

export interface ResetPasswordRequest {
  userName: string,
  resetToken: string,
  newPassword: string
}

export function makeResetPasswordRouter(userRepo: UserRepository) {
  const resetPasswordService = makeResetPasswordService(userRepo)

  return Router().post("/", async (req: Request<object, object, ResetPasswordRequest>, res) => {
    const { userName, resetToken, newPassword } = req.body
    try {
      const result = await resetPasswordService.resetPassword({ userName, resetToken, newPassword })
      res.json(result)
    } catch (error) {
      if (isExpressError(error as Error)) {
        res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
      } else {
        res.status(500).json({ error: (error as Error).message })
      }
    }
  })
}
