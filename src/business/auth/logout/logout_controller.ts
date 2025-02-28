import { Router } from "express"

export function makeLogoutRouter() {
  return Router().post("/", (req, res) => {
    try {
      // Destroy any server-side session if used
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            throw Error("Session destruction error")
          }
        });
      }

      res.status(200).json({ message: "Successfully logged out" })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({ message: "Error during logout" })
    }
  })
}
