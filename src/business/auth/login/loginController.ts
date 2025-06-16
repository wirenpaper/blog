import { Router, Request, Response } from "express"
import { makeLoginService } from "@business/auth/login/loginService.js"
import { UserRepository } from "@db/user/userRepository.js"
import { isExpressError, ExpressError } from "@src/errors.js"
import { validateLogin } from "@business/auth/login/loginValidator.js"
import { validation } from "@business/aux.js"

export interface MakeLoginRequest {
  userName: string,
  password: string
}

export function makeLoginRouter(userRepo: UserRepository) {
  const loginService = makeLoginService(userRepo)

  return Router().post("/",
    validateLogin,
    async (req: Request<object, object, MakeLoginRequest>, res: Response) => {
      if (!validation(req, res)) return
      const { userName, password } = req.body
      try {
        const result = await loginService.loginUser({ userName, password })

        res.json({ token: result.token, userWithoutPassword: result.userWithoutPassword })
      } catch (error) {
        if (isExpressError(error as Error)) {
          res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
        } else {
          res.status(500).json({ error: (error as Error).message })
        }
      }
    })
}
