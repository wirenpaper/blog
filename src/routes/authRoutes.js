// authRoutes.js
import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from 'crypto'

// We still import `authMiddleware` if we need it
import authMiddleware from '../middleware/authMiddleware.js'

/**
 * Build the Auth Router by injecting dependencies:
 *  1) userRepo - an object with methods like .createUser(...)
 *  2) sql      - your raw DB client if you still need direct queries (e.g., login)
 */
export function buildAuthRoutes(userRepo) {
  const router = express.Router()

  // 1. REGISTER: /auth/register
  router.post("/register", async (req, res) => {
    const { username, password, firstname, lastname } = req.body
    const hashedPassword = bcrypt.hashSync(password, 8)

    try {
      // Use the injected userRepo to create a user
      const user = await userRepo.createUser({
        username,
        hashedPassword,
        firstname,
        lastname
      })

      // Create JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      )

      res.json({ token })
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ message: "Username already exists" })
      }
      console.error('Registration error:', error)
      res.status(503).json({ message: "Service unavailable" })
    }
  })

  // 2. LOGIN: /auth/login
  router.post("/login", async (req, res) => {
    const { username, password } = req.body

    try {
      // Currently still using the injected sql directly:
      const user = await userRepo.getUsersByUsername({ username })

      if (!user) {
        return res.status(404).json({ message: "User not found!" })
      }

      const passwordIsValid = bcrypt.compareSync(password, user.password)
      if (!passwordIsValid) {
        return res.status(401).json({ message: "Incorrect username/password" })
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      )

      const { password: _, ...userWithoutPassword } = user
      res.json({ token, user: userWithoutPassword })
    } catch (error) {
      console.error('Login error:', error)
      res.status(503).json({ message: "Service unavailable" })
    }
  })

  // 3. LOGOUT: /auth/logout
  router.post("/logout", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (token) {
        // If you have a blacklist, store the token here
      }

      // Destroy any server-side session if used
      if (req.session) {
        req.session.destroy()
      }

      res.status(200).json({ message: "Successfully logged out" })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({ message: "Error during logout" })
    }
  })

  // 4. FORGOT-PASSWORD: /auth/forgot-password
  router.post("/forgot-password", async (req, res) => {
    const { username } = req.body
    try {
      const user = await userRepo.getUsersByUsername({ username })

      // We respond 200 even if user doesn’t exist, for security
      if (!user) {
        return res.status(200).json({
          message: "If an account exists, a reset link will be sent"
        })
      }

      // Use crypto for the reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenHash = await bcrypt.hash(resetToken, 10)
      const expiryTime = new Date(Date.now() + 3600000) // 1 hour
      const userId = user.id

      await userRepo.updateUserResetToken({
        resetTokenHash,
        expiryTime,
        userId
      })

      // In production: send resetToken via email
      res.json({
        message: "Reset instructions sent",
        resetToken
      })
    } catch (error) {
      console.error('Password reset request error:', error)
      res.status(500).json({ message: "Error processing request" })
    }
  })

  // 5. VERIFY RESET TOKEN: /auth/verify-reset-token
  router.post("/verify-reset-token", async (req, res) => {
    const { resetToken } = req.body
    try {
      // Get all valid tokens
      const users = await userRepo.getResetTokens()

      let foundUser = null
      for (let user of users) {
        if (await bcrypt.compare(resetToken, user.reset_token)) {
          foundUser = user
          break
        }
      }

      if (!foundUser) {
        return res.status(400).json({ message: "Invalid or expired token" })
      }

      const foundUserId = foundUser.id
      // Mark token as verified
      await userRepo.updateTokenVerified({ foundUserId })

      res.json({ message: "Token verified, proceed to password reset" })
    } catch (error) {
      console.error('Token verification error:', error)
      res.status(500).json({ message: "Error verifying token" })
    }
  })

  // 6. RESET PASSWORD: /auth/reset-password
  router.post("/reset-password", async (req, res) => {
    const { username, resetToken, newPassword } = req.body
    try {
      const user = await userRepo.getUserByVerifiedToken({ username })

      if (!user) {
        return res.status(400).json({ message: "Invalid, expired, or unverified token" })
      }

      const tokenValid = await bcrypt.compare(resetToken, user.reset_token)
      if (!tokenValid) {
        return res.status(400).json({ message: "Invalid token" })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)

      const userId = user.id
      await userRepo.updateUserPassword({ hashedPassword, userId })

      res.json({ message: "Password successfully reset" })
    } catch (error) {
      console.error('Password reset error:', error)
      res.status(500).json({ message: "Error resetting password" })
    }
  })

  // 7. CHANGE PASSWORD (LOGGED IN): /auth/change-password-logged-in
  router.post("/change-password-logged-in", authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body
    try {
      const reqUserId = req.userId
      const user = await userRepo.getUserById({ reqUserId })
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      const passwordIsValid = await bcrypt.compare(currentPassword, user.password)
      if (!passwordIsValid) {
        return res.status(401).json({ message: "Current password is incorrect" })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      const userId = user.id
      await userRepo.updateLoggedInUserPassword({ hashedPassword, userId })
      res.json({ message: "Password successfully changed" })
    } catch (error) {
      console.error('Password change error:', error)
      res.status(500).json({ message: "Error changing password" })
    }
  })

  return router
}
