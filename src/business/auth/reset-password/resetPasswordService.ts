import { UserRepository } from "@db/user/user_repository.js"
import { createExpressError } from "@src/errors.js"
import bcrypt from "bcrypt"

interface ResetPasswordParams {
  userName: string,
  resetToken: string,
  newPassword: string
}

interface ResetPasswordResult {
  message: string
}

export interface MakeResetPasswordService {
  resetPassword: (params: ResetPasswordParams) => Promise<ResetPasswordResult>
}

export function makeResetPasswordService(userRepo: UserRepository): MakeResetPasswordService {
  return {
    async resetPassword({ userName, resetToken, newPassword }) {
      const user = await userRepo.getResetToken({ userName })
      if (!user)
        throw createExpressError(400, "Invalid or expired token")

      const tokenValid = await bcrypt.compare(resetToken, user.resetToken)
      if (!tokenValid)
        throw createExpressError(400, "Invalid or expired token")

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await userRepo.updateUserPassword({ hashedPassword, userId: user.id })
      return { message: "Password successfully reset" }
    }
  }
}
