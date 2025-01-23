import { Router, Request, Response } from "express"
import { UserRepository } from "../../../db/user/user_repository.js";
import { makeChangePasswordLoggedInService } from "./change_password_logged_in_service.js";
import { PostgressDBError, UserError } from "../../../errors.js";
import authMiddleware from "../../../middleware/authMiddleware.js";

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export function makeChangePasswordLoggedInRouter(userRepo: UserRepository) {
  const changePasswordLoggedInService = makeChangePasswordLoggedInService(userRepo)

  return Router().post("/", authMiddleware, async (req: Request<object, object, ChangePasswordRequest>, res: Response) => {
    const { currentPassword, newPassword } = req.body
    try {
      if (!req.userId) {
        throw new UserError(500, makeChangePasswordLoggedInRouter, "userId doesnt exist")
      }
      const userId = req.userId
      const result = await changePasswordLoggedInService.changePasswordLoggedIn({ userId, currentPassword, newPassword })

      res.json({ result })
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof UserError) {
        const { statusCode, name, func, message } = error
        res.status(statusCode).json({ name, func, message })
        return
      }
      res.status(500).json(error)
    }
  })
}
