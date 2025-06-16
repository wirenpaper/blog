import { body, param } from "express-validator"

export const validateEditPost = [
  param("id")
    .isNumeric().withMessage("ID must be a numeric value.")
    .isInt({ min: 1 }).withMessage("ID must be a positive integer.")
    .toInt(), // Sanitizer: converts to integer after validation

  body("mPost")
    .trim() // Sanitizer: removes leading/trailing whitespace
    .notEmpty().withMessage("Post cannot be empty.")
    .isString().withMessage("Post must be a string.")
    .isLength({ min: 1, max: 2000 }).withMessage("Post must be between 1 and 2000 characters.")
]
