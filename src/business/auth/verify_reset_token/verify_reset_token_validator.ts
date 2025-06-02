import { body } from "express-validator"

export const validateResetToken = [
  body("resetToken")
    .trim()
    .notEmpty().withMessage("resetToken cannot be empty.")
]
