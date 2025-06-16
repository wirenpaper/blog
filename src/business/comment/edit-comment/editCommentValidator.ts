import { body, param } from "express-validator"

export const validateEditComment = [
  param("id")
    .isNumeric().withMessage("ID must be a numeric value.")
    .isInt({ min: 1 }).withMessage("ID must be a positive integer.")
    .toInt(), // Sanitizer: converts to integer after validation

  body("mComment")
    .trim() // Sanitizer: removes leading/trailing whitespace
    .notEmpty().withMessage("Comment cannot be empty.")
    .isString().withMessage("Comment must be a string.")
    .isLength({ min: 1, max: 500 }).withMessage("Comment must be between 1 and 500 characters.")
// .escape() // Sanitizer: to prevent XSS if you render this HTML directly (be careful with this)
]
