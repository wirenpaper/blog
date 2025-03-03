import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { UserRepository } from "@db/user/user_repository.js"
import { JWTError, UserError } from "@src/errors.js"

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

      if (!user) {
        throw new UserError(401, this.loginUser, "Invalid username/password")
      }

      const passwordIsValid = await bcrypt.compare(password, user.hashedPassword)
      if (!passwordIsValid) {
        throw new UserError(401, this.loginUser, "Invalid username/password")
      }

      let token
      try {
        token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET!,
          { expiresIn: "24h" }
        )
      } catch (error) {
        throw new JWTError(error, this.loginUser)
      }

      const { hashedPassword: _, ...userWithoutPassword } = user
      return { token, userWithoutPassword }
    }
  }
}
