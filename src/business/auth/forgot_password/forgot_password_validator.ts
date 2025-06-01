import { body } from "express-validator"

export const validateForgotPassword = [
  body("userName")
    .trim()
    .notEmpty().withMessage("User name cannot be empty."),
]
