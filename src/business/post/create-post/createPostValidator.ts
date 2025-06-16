import { body } from "express-validator"

export const validateCreatePost = [
  body("mPost")
    .trim() // Sanitizer: removes leading/trailing whitespace
    .notEmpty().withMessage("Post cannot be empty.")
    .isString().withMessage("Post must be a string.")
    .isLength({ min: 1, max: 2000 }).withMessage("Post must be between 1 and 2000 characters.")
]
