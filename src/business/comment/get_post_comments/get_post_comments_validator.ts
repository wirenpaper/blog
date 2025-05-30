import { param } from "express-validator"

export const validateGetPostComments = [
  param("postId")
    .isNumeric().withMessage("postId must be a numeric value.")
    .isInt({ min: 1 }).withMessage("postId must be a positive integer.")
    .toInt() // Sanitizer: converts to integer after validation
]
