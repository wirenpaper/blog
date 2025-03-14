import { Router, Request, Response } from "express"
import { UserRepository } from "@db/user/user_repository.js"
import { makeChangePasswordLoggedInService } from
  "@business/auth/change_password_logged_in/change_password_logged_in_service.js"
import { createExpressError, ExpressError, isExpressError } from "@src/errors.js"

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export function makeChangePasswordLoggedInRouter(userRepo: UserRepository) {
  const changePasswordLoggedInService = makeChangePasswordLoggedInService(userRepo)

  return Router().post("/", async (req: Request<object, object, ChangePasswordRequest>, res: Response) => {
    const { currentPassword, newPassword } = req.body
    try {
      if (!req.userId)
        throw createExpressError(500, "userId doesnt exist")

      const userId = req.userId
      const result = await changePasswordLoggedInService.changePasswordLoggedIn({ userId, currentPassword, newPassword })

      res.json({ result })
    } catch (error) {
      if (isExpressError(error as Error)) {
        res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
      } else {
        res.status(500).json({ error: (error as Error).message })
      }
    }
  })
}
