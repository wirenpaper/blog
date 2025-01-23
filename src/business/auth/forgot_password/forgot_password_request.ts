import { Router, Request } from "express";
import { UserRepository } from "../../../db/user/user_repository.js";
import { makeForgotPasswordService } from "./forgot_password_service.js";

interface ForgotPasswordRequest {
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
      console.error('Password reset request error:', error)
      res.status(500).json({ message: "Error processing request" })
    }
  })
}
