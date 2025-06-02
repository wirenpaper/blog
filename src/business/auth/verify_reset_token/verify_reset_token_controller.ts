import { Router, Request, Response } from "express"
import { UserRepository } from "@db/user/user_repository.js"
import { makeVerifyResetTokenService } from "@business/auth/verify_reset_token/verify_reset_token_service.js"
import { ExpressError, isExpressError } from "@src/errors.js"
import { validateResetToken } from "./verify_reset_token_validator.js"
import { validation } from "@business/aux.js"

export interface ResetRequest {
  resetToken: string
}

export function makeVerifyResetTokenRouter(userRepo: UserRepository) {
  const verifyResetTokenService = makeVerifyResetTokenService(userRepo)

  return Router().post("/",
    validateResetToken,
    async (req: Request<object, object, ResetRequest>, res: Response) => {
      if (!validation(req, res)) return
      const { resetToken } = req.body
      try {
        const message = await verifyResetTokenService.verifyResetToken({ resetToken })
        res.json(message)
      } catch (error) {
        if (isExpressError(error as Error)) {
          res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
        } else {
          res.status(500).json({ error: (error as Error).message })
        }
      }
    })
}
