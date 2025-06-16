import { Router, Request } from "express"
import { makeDeleteUserService } from "@business/auth/delete-user/deleteUserService.js"
import { isExpressError, ExpressError } from "@src/errors.js"
import { UserRepository } from "@db/user/userRepository.js"

export function makeDeleteUserRouter(repo: UserRepository) {
  const deleteUserService = makeDeleteUserService(repo)

  return Router().delete("/", async (req: Request, res) => {
    try {
      await deleteUserService.deleteUser({ userId: req.userId! })
      res.json({ message: "User deleted" })
    } catch (error) {
      if (isExpressError(error as Error)) {
        res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
      } else {
        res.status(500).json({ error: (error as Error).message })
      }
    }
  })
}
