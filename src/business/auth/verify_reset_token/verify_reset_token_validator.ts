import { query } from "express-validator"

export const validateResetToken = [
  query("resetToken")
    .trim()
    .notEmpty().withMessage("resetToken cannot be empty.")
]
