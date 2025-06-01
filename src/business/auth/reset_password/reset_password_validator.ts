import { body } from "express-validator"

export const validateResetPassword = [
  body("userName")
    .trim()
    .notEmpty().withMessage("User name cannot be empty."),
  body("resetToken")
    .trim()
    .notEmpty().withMessage("Reset token cannot be empty."),
  body("newPassword")
    .trim()
    .notEmpty().withMessage("New password is required.")
    .isLength({ min: 8, max: 128 }).withMessage("New password must be between 8 and 128 characters.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.")
]
