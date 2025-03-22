import { UserRepository } from "@db/user/user_repository.js"
import { createExpressError } from "@src/errors.js"
import bcrypt from "bcrypt"

interface VerifyResetTokenParams {
  resetToken: string
}

interface VerifyResetTokenResult {
  message: string
}

export interface MakeVerifyResetTokenService {
  verifyResetToken: (params: VerifyResetTokenParams) => Promise<VerifyResetTokenResult>
}

export function makeVerifyResetTokenService(userRepo: UserRepository): MakeVerifyResetTokenService {
  return {
    async verifyResetToken({ resetToken }) {
      const users = await userRepo.getResetTokens()
      if (users.length === 0)
        throw createExpressError(500, "No reset tokens found")

      let user
      for (let el of users) {
        if (await bcrypt.compare(resetToken, el.resetToken)) {
          user = el
          break
        }
      }

      if (!user)
        throw createExpressError(500, "Invalid or expired token")

      const userId = user.id
      await userRepo.updateTokenVerified({ userId })

      const message = "Token verified, proceed to password reset"
      return { message }
    }
  }
}
