import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { createUser as createUserModel, isValidPassword, sanitizeUser } from '../../../db/user/user_model.js'
import { UserRepository } from "../../../db/user/user_repository.js"
import { JWTError, UserError } from "../../../errors.js"

const SALT_ROUNDS = 10

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
      if (!isValidPassword(password)) {
        throw new Error('Password does not meet requirements')
      }

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
      if (!user) {
        throw new UserError(500, this.registerUser, "User does not exist")
      }

      // Create token and return sanitized user data
      let token
      try {
        token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" })
      } catch (error) {
        throw new JWTError(error, this.registerUser)
      }

      return {
        token,
        user: sanitizeUser(user)
      }
    }
  }
}
