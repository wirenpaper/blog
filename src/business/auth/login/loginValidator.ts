import { body } from "express-validator"

export const validateLogin = [
  body("userName")
    .trim()
    .notEmpty().withMessage("User name cannot be empty."),
  body("password")
    .trim()
    .notEmpty().withMessage("Password cannot be empty."),
]
