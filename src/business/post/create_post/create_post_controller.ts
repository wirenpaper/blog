import { Router, Request, Response } from "express";
import { PostRepository } from "@db/post/post_repository.js";
import { makePostService } from "@business/post/create_post/create_post_service.js"
import { PostgressDBError, PostError } from "@src/errors.js";

interface PostService {
  mPost: string,
}

export function makePostRouter(postRepo: PostRepository) {
  const postService = makePostService(postRepo)

  return Router().post("/", async (req: Request<object, object, PostService>, res: Response) => {
    const { mPost } = req.body
    try {
      if (!req.userId) {
        throw Error("req.userId does not exist")
      }
      const result = await postService.createPost({ mPost, userId: req.userId })
      res.json(result)
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof PostError) {
        const { name, statusCode, message, func } = error
        res.status(statusCode).json({ name, func, message });
        return
      }
      res.status(500).json({ message: (error as Error).message })
    }
  })
}
