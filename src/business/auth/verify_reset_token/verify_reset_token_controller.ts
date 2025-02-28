import { Router, Request } from "express"
import { UserRepository } from "../../../db/user/user_repository.js"
import { makeVerifyResetTokenService } from "./verify_reset_token_service.js"
import { PostgressDBError, UserError } from "../../../errors.js";

interface ResetRequest {
  resetToken: string
}

export function makeVerifyResetTokenRouter(userRepo: UserRepository) {
  const verifyResetTokenService = makeVerifyResetTokenService(userRepo)

  return Router().post("/", async (req: Request<object, object, ResetRequest>, res) => {
    const { resetToken } = req.body
    try {
      const msg = await verifyResetTokenService.verifyResetToken({ resetToken })
      res.json({ msg })
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof UserError) {
        const { statusCode, message, func } = error;
        res.status(statusCode).json({ statusCode, func, message });
        return
      }
      res.status(500).json({ message: (error as Error).message })
    }
  })
}
