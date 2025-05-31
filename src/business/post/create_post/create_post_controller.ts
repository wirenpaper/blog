import { Router, Request, Response } from "express"
import { PostRepository } from "@db/post/post_repository.js"
import { makePostService } from "@business/post/create_post/create_post_service.js"
import { isExpressError, ExpressError } from "@src/errors.js"
import { validateCreatePost } from "./create_post_validator"
import { validation } from "@business/aux.js"

export interface PostService {
  mPost: string,
}

export function makePostRouter(postRepo: PostRepository) {
  const postService = makePostService(postRepo)

  return Router().post("/",
    validateCreatePost,
    async (req: Request<object, object, PostService>, res: Response) => {
      if (!validation(req, res)) return
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
