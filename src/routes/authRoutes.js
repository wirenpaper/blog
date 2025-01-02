import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from 'crypto';
import sql from "../db.js"
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Register a new user endpoint /auth/register
router.post("/register", async (req, res) => {
  const { username, password, firstname, lastname } = req.body
  const hashedPassword = bcrypt.hashSync(password, 8)

  try {
    // Insert new user with all fields and return the id
    const [user] = await sql`
      INSERT INTO users (username, password, firstname, lastname)
      VALUES (${username}, ${hashedPassword}, ${firstname}, ${lastname})
      RETURNING id
    `

    // Create JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )

    res.json({ token })
  } catch (error) {
    // Check for unique violation on username
    if (error.code === '23505') {
      return res.status(400).json({ message: "Username already exists" })
    }
    console.error('Registration error:', error)
    res.status(503).json({ message: "Service unavailable" })
  }
})

router.post("/login", async (req, res) => {
  const { username, password } = req.body

  try {
    // Get user by username, now including firstname and lastname
    const [user] = await sql`
      SELECT id, username, password, firstname, lastname
      FROM users
      WHERE username = ${username}
    `

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

    // Return user info (except password) along with token
    const { password: _, ...userWithoutPassword } = user
    res.json({
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(503).json({ message: "Service unavailable" })
  }
})

router.post("/logout", async (req, res) => {
  try {
    // Optional: If you're maintaining a blacklist of invalidated tokens
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      // You could store invalidated tokens in Redis/database until their exp time
      // await blacklistToken(token)
    }

    // Clear any server-side session data if you have any
    if (req.session) {
      req.session.destroy()
    }

    res.status(200).json({ message: "Successfully logged out" })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: "Error during logout" })
  }
})

// 1. Initiate password reset, get token (simulating email)
router.post("/forgot-password", async (req, res) => {
  const { username } = req.body
  try {
    const [user] = await sql`
      SELECT id, username FROM users 
      WHERE username = ${username}
    `

    if (!user) {
      return res.status(200).json({
        message: "If an account exists, a reset link will be sent"
      })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = await bcrypt.hash(resetToken, 10)
    const expiryTime = new Date(Date.now() + 3600000) // 1 hour

    await sql`
      UPDATE users
      SET reset_token = ${resetTokenHash},
          reset_token_expires = ${expiryTime}
      WHERE id = ${user.id}
    `

    res.json({
      message: "Reset instructions sent",
      resetToken // In production this would be sent via email
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    res.status(500).json({ message: "Error processing request" })
  }
})

// 2. Verify token and mark as verified so password reset can proceed
router.post("/verify-reset-token", async (req, res) => {
  const { resetToken } = req.body
  try {
    // Get all non-expired reset tokens
    const users = await sql`
      SELECT id, reset_token
      FROM users
      WHERE reset_token IS NOT NULL
      AND reset_token_expires > NOW()
    `
    // Find the user whose token matches
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

    // Token matched, mark as verified
    await sql`
      UPDATE users 
      SET token_verified = true
      WHERE id = ${foundUser.id}
    `

    res.json({ message: "Token verified, proceed to password reset" })
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(500).json({ message: "Error verifying token" })
  }
})

// 3. Actually reset the password if token was verified
router.post("/reset-password", async (req, res) => {
  const { resetToken, newPassword } = req.body
  try {
    const [user] = await sql`
      SELECT id, reset_token
      FROM users
      WHERE reset_token_expires > NOW()
      AND token_verified = true
    `
    if (!user) {
      return res.status(400).json({ message: "Invalid, expired, or unverified token" })
    }

    const tokenValid = await bcrypt.compare(resetToken, user.reset_token)
    if (!tokenValid) {
      return res.status(400).json({ message: "Invalid token" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await sql`
      UPDATE users
      SET password = ${hashedPassword},
          reset_token = NULL,
          reset_token_expires = NULL,
          token_verified = false
      WHERE id = ${user.id}
    `

    res.json({ message: "Password successfully reset" })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({ message: "Error resetting password" })
  }
})

router.post("/change-password-logged-in", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  try {
    // We have user.id from auth token
    const [user] = await sql`
      SELECT id, password
      FROM users
      WHERE id = ${req.userId}
    `

    // Verify current password
    const passwordIsValid = await bcrypt.compare(currentPassword, user.password)
    if (!passwordIsValid) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await sql`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE id = ${user.id}
    `

    res.json({ message: "Password successfully changed" })
  } catch (error) {
    console.error('Password change error:', error)
    res.status(500).json({ message: "Error changing password" })
  }
})

export default router
