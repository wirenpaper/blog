import { Router, Request } from "express"
import { UserRepository } from "@db/user/user_repository.js"
import { makeForgotPasswordService } from "@business/auth/forgot_password/forgot_password_service.js"
import { ExpressError, isExpressError } from "@src/errors.js"

export interface ForgotPasswordRequest {
  userName: string
}

export function makeForgotPasswordRouter(userRepo: UserRepository) {
  const forgotPasswordService = makeForgotPasswordService(userRepo)

  return Router().post("/", async (req: Request<object, object, ForgotPasswordRequest>, res) => {
    const { userName } = req.body
    try {
      const result = await forgotPasswordService.forgotPassword({ userName })

      // In production: send resetToken via email
      res.json(result)
    } catch (error) {
      if (isExpressError(error as Error)) {
        res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
      } else {
        res.status(500).json({ error: (error as Error).message })
      }
    }
  })
}
