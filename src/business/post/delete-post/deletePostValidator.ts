import { param } from "express-validator"

export const validateDeletePost = [
  param("id")
    .isNumeric().withMessage("ID must be a numeric value.")
    .isInt({ min: 1 }).withMessage("ID must be a positive integer.")
    .toInt(), // Sanitizer: converts to integer after validation
]
