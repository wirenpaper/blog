import { Router, Request } from "express";
import { PostRepository } from "@db/post/post_repository.js";
import { PostgressDBError, PostError, UserError } from "@src/errors.js";
import { makeEditPostService } from "@business/post/edit_post/edit_post_service.js"

export function makeEditPostRouter(postRepo: PostRepository) {
  const editPostService = makeEditPostService(postRepo)

  return Router().put("/:id", async (req: Request<{ id: number }, object, { mPost: string }>, res) => {
    const { id } = req.params
    const { mPost } = req.body
    const userId = req.userId

    try {
      if (!userId) {
        throw new UserError(403, makeEditPostRouter, "User Id does not exist")
      }

      await editPostService.editPost({ id, mPost, userId })

      res.status(200).json({ message: "Post edited" })
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof PostError) {
        const { statusCode, name, func, message } = error
        res.status(statusCode).json({ name, func, message })
      }
      res.json(error as Error)
    }
  })
}
