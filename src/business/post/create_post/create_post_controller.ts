import { Router, Request, Response } from "express"
import { PostRepository } from "@db/post/post_repository.js"
import { makePostService } from "@business/post/create_post/create_post_service.js"
import { isExpressError, ExpressError } from "@src/errors.js"
import { validationResult } from "express-validator"
import { validateCreatePost } from "./create_post_validator"

export interface PostService {
  mPost: string,
}

export function makePostRouter(postRepo: PostRepository) {
  const postService = makePostService(postRepo)

  return Router().post("/",
    validateCreatePost,
    async (req: Request<object, object, PostService>, res: Response) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => (err.msg as string)).join(", ")
        res.status(400).json({ message: errorMessages })
        return
      }
      const { mPost } = req.body
      try {
        const result = await postService.createPost({ mPost, userId: req.userId })
        res.json(result)
      } catch (error) {
        if (isExpressError(error as Error)) {
          res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
        } else {
          res.status(500).json({ error: (error as Error).message })
        }
      }
    })
}
