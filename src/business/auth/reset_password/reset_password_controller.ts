import { Router, Request } from "express"
import { UserRepository } from "@db/user/user_repository.js";
import { makeResetPasswordService } from "@business/auth/reset_password/reset_password_service.js"
import { PostgressDBError, UserError } from "@src/errors.js";

interface ResetPasswordRequest {
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
      if (error instanceof PostgressDBError || error instanceof UserError) {
        const { statusCode, message, func } = error;
        res.status(statusCode).json({ statusCode, func, message });
        return
      }
      res.status(500).json({ message: (error as Error).message })
    }
  })
}
