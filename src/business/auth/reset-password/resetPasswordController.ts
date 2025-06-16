import { Router, Request, Response } from "express"
import { UserRepository } from "@db/user/userRepository.js"
import { makeResetPasswordService } from "@business/auth/reset-password/resetPasswordService.js"
import { ExpressError, isExpressError } from "@src/errors.js"
import { validateResetPassword } from "./resetPasswordValidator.js"
import { validation } from "@business/aux.js"

export interface ResetPasswordRequest {
  userName: string,
  resetToken: string,
  newPassword: string
}

export function makeResetPasswordRouter(userRepo: UserRepository) {
  const resetPasswordService = makeResetPasswordService(userRepo)

  return Router().post("/",
    validateResetPassword,
    async (req: Request<object, object, ResetPasswordRequest>, res: Response) => {
      if (!validation(req, res)) return
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
