import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { UserRepository } from "@db/user/user_repository.js"
import { createExpressError } from "@src/errors.js"

interface LoginUserParams {
  userName: string,
  password: string
}

interface LoginUserResult {
  token: string,
  userWithoutPassword: {
    id?: number,
    userName: string
  }
}

export interface MakeLoginService {
  loginUser: (params: LoginUserParams) => Promise<LoginUserResult>
}

export function makeLoginService(userRepo: UserRepository): MakeLoginService {
  return {
    async loginUser({ userName, password }) {

      const user = await userRepo.getUserByUsername({ userName })

      if (!user)
        throw createExpressError(401, "Invalid username/password")

      const passwordIsValid = await bcrypt.compare(password, user.hashedPassword)
      if (!passwordIsValid)
        throw createExpressError(401, "Invalid username/password")

      let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" })

      const { hashedPassword: _, ...userWithoutPassword } = user
      return { token, userWithoutPassword }
    }
  }
}
