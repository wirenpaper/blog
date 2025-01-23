import { Router, Request } from "express";
import { PostRepository } from "../../../db/post/post_repository.js";
import { makeDeletePostService } from "./delete_post_service.js";
import { PostgressDBError, PostError, UserError } from "../../../errors.js";

export function makeDeletePostRouter(repo: PostRepository) {
  const deletePostService = makeDeletePostService(repo)

  return Router().delete("/:id", async (req: Request<{ id: number }, object, object>, res) => {
    const { id } = req.params
    const userId = req.userId
    try {
      if (!userId) {
        throw new UserError(403, makeDeletePostRouter, "User id not found")
      }
      await deletePostService.deletePost({ id, userId })
      res.json({ message: "Post deleted" })
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof PostError) {
        const { statusCode, name, func, message } = error
        res.status(statusCode).json({ name, func, message })
      }
      res.json({ error })
    }
  })
}
