import { UserRepository } from "@db/user/user_repository.js"
import { createExpressError } from "@src/errors.js"
import bcrypt from "bcrypt"

interface ChangePasswordLoggedInParams {
  userId: number
  currentPassword: string
  newPassword: string
}

interface ChangePasswordLoggedInResult {
  message: string
}

export interface MakeChangePasswordLoggedInService {
  changePasswordLoggedIn: (params: ChangePasswordLoggedInParams) => Promise<ChangePasswordLoggedInResult>
}

export function makeChangePasswordLoggedInService(userRepo: UserRepository): MakeChangePasswordLoggedInService {
  return {
    async changePasswordLoggedIn({ userId, currentPassword, newPassword }) {
      const user = await userRepo.getUserById({ userId })

      if (!user.hashedPassword) {
        throw createExpressError(400, "User has no password")
      }

      const passwordIsValid = await bcrypt.compare(currentPassword, user.hashedPassword)

      if (!passwordIsValid) {
        throw createExpressError(401, "Current password is incorrect")
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await userRepo.updateLoggedInUserPassword({ hashedPassword, userId })
      return { message: "Password successfully changed" }
    }
  }
}
