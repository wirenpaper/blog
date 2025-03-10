import { Session } from "express-session"
import { createExpressError } from "@src/errors.js"

export async function destroySession(session: Session | undefined): Promise<void> {
  if (session) {
    // Wrap session.destroy in a Promise
    await new Promise<void>((resolve, reject) => {
      session.destroy((err) => {
        if (err) {
          // Reject the Promise with the error
          reject(createExpressError(500, "Session destruction error")) // <-- Use reject here
        } else {
          // Resolve the Promise if no error
          resolve()
        }
      })
    })
  }
}
