import { Router, Request } from 'express'
import { makeRegisterService } from './register_service.js'
import { UserRepository } from '../../../db/user/user_repository.js'
import { PostgressDBError, JWTError } from '../../../errors.js'

interface RegisterRequest {
  userName: string,
  password: string,
  firstName: string,
  lastName: string
}

export function makeRegisterRouter(userRepo: UserRepository) {
  const registerService = makeRegisterService(userRepo)

  return Router().post("/", async (req: Request<object, object, RegisterRequest>, res) => {
    const { userName, password, firstName, lastName } = req.body

    try {
      const result = await registerService.registerUser({
        userName,
        password,
        firstName,
        lastName
      })


      res.json({ token: result.token })
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof JWTError) {
        const { statusCode, message, func } = error;
        res.status(statusCode).json({ statusCode, func, message });
        return
      }
      res.status(500).json({ message: (error as Error).message })
    }
  })
}
