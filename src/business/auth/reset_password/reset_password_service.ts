import { UserRepository } from "@db/user/user_repository.js";
import { UserError } from "@src/errors.js";
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
      const user = await userRepo.getUserByVerifiedToken({ userName })
      if (!user) {
        throw new UserError(400, this.resetPassword, "Invalid, expired, or unverified token")
      }

      const tokenValid = await bcrypt.compare(resetToken, user.resetToken)
      if (!tokenValid) {
        throw new UserError(400, this.resetPassword, "Invalid token")
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)

      const userId = user.id
      await userRepo.updateUserPassword({ hashedPassword, userId })

      return { message: "Password successfully reset" }
    }
  }
}
