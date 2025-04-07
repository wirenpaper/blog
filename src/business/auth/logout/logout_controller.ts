import { Router } from "express"
import { isExpressError, ExpressError } from "@src/errors.js"
import { destroySession } from "./session_service.js"

export function makeLogoutRouter() {
  return Router().post("/", async (req, res) => {
    try {
      // Destroy any server-side session if used
      await destroySession(req.session)
      res.status(200).json({ message: "Successfully logged out" })
    } catch (error) {
      if (isExpressError(error as Error)) {
        res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
      } else {
        res.status(500).json({ error: (error as Error).message })
      }
    }
  })
}
