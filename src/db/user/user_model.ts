import crypto from "crypto"

export interface UserModel {
  id?: number
  userName: string
  hashedPassword: string
  firstName?: string | null
  lastName?: string | null
  resetToken?: string
  resetTokenExpires?: Date
  tokenVerified?: boolean
}

export function createUser(user: UserModel): UserModel {
  const {
    id,
    userName,
    hashedPassword,
    firstName,
    lastName,
    resetToken,
    resetTokenExpires,
    tokenVerified = false
  } = user

  return {
    id,
    userName,
    hashedPassword,
    firstName,
    lastName,
    resetToken,
    resetTokenExpires,
    tokenVerified
  };
}

// Helper functions
export function isValidPassword(password: string) {
  if (password == "" || password == undefined || password == null)
    return false

  return password && password.length >= 8 &&
    /[A-Z]/.test(password) &&     // At least one uppercase
    /[a-z]/.test(password) &&     // At least one lowercase
    /[0-9]/.test(password)        // At least one number
}

export function sanitizeUser(user: UserModel) {
  // Return user without sensitive data
  const { hashedPassword, resetToken, resetTokenExpires, ...safeUser } = user
  return safeUser
}

export function createPasswordResetToken() {
  // Helper for generating reset tokens
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 3600000) // 1 hour from now
  return { token, expires }
}
