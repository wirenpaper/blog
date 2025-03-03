import { Router, Request } from 'express'
import { makeRegisterService } from '@business/auth/register/register_service.js'
import { UserRepository } from '@db/user/user_repository.js'
import { isExpressError, ExpressError } from '@src/errors.js'

export interface RegisterRequest {
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
      if (isExpressError(error as Error)) {
        res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
      } else {
        res.status(500).json({ error: (error as Error).message })
      }
    }
  })
}
