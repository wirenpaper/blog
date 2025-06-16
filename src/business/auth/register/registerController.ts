import { Router, Request, Response } from "express"
import { makeRegisterService } from "@business/auth/register/registerService.js"
import { UserRepository } from "@db/user/userRepository.js"
import { isExpressError, ExpressError } from "@src/errors.js"
import { validateRegister } from "./registerValidator.js"
import { validation } from "@business/aux.js"

export interface RegisterRequest {
  userName: string,
  password: string,
  firstName?: string,
  lastName?: string
}

export function makeRegisterRouter(userRepo: UserRepository) {
  const registerService = makeRegisterService(userRepo)

  return Router().post("/",
    validateRegister,
    async (req: Request<object, object, RegisterRequest>, res: Response) => {
      if (!validation(req, res)) return
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
