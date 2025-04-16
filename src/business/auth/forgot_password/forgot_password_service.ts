import bcrypt from "bcrypt"
import { UserRepository } from "@db/user/user_repository.js"
import { createExpressError } from "@src/errors.js"
import crypto from "crypto"

interface ForgotPasswordResults {
  message: string,
  resetToken: string,
}

export interface MakeForgotPasswordService {
  forgotPassword: (params: { userName: string }) => Promise<ForgotPasswordResults>
}

export function makeForgotPasswordService(userRepo: UserRepository): MakeForgotPasswordService {
  return {
    async forgotPassword({ userName }) {
      const user = await userRepo.getUserByUsername({ userName })
      if (!user) {
        throw createExpressError(401, "Unknown user")
      }

      // Use crypto for the reset token
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetTokenHash = await bcrypt.hash(resetToken, 10)
      const expiryTime = new Date(Date.now() + 3600000) // 1 hour
      const userId = user.id

      await userRepo.updateUserResetToken({
        resetTokenHash,
        expiryTime,
        userId
      })

      return ({
        message: "Reset instructions sent",
        resetToken
      })
    }
  }
}
