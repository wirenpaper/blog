import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { createUser as createUserModel, isValidPassword, sanitizeUser } from "@db/user/user_model.js"
import { UserRepository } from "@db/user/user_repository.js"
import { createExpressError } from "@src/errors.js"

const SALT_ROUNDS = 12

interface RegisterUserParams {
  userName: string,
  password: string,
  firstName: string | null,
  lastName: string | null
}

interface RegisterUserResult {
  token: string
  user: {
    id?: number
    userName: string
  }
}

export interface MakeRegisterService {
  registerUser: (params: RegisterUserParams) => Promise<RegisterUserResult>
}

export function makeRegisterService(userRepo: UserRepository): MakeRegisterService {
  return {
    async registerUser({
      userName,
      password,
      firstName,
      lastName
    }) {
      // Validate password before hashing
      if (!isValidPassword(password))
        throw createExpressError(422, "Password does not meet requirements")

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

      // Create user model to validate data
      const userData = createUserModel({
        userName,
        hashedPassword,
        firstName,
        lastName
      })

      // Save to database via repository
      const user = await userRepo.createUser(userData)
      if (!user)
        throw createExpressError(404, "User does not exist")

      // Create token and return sanitized user data
      if (!process.env.JWT_SECRET) {
        throw createExpressError(500, "process.env.JWT_SECRET is undefined")
      }

      let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "24h" })

      return {
        token,
        user: sanitizeUser(user)
      }
    }
  }
}
