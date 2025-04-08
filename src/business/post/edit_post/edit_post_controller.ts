import { Router, Request } from "express"
import { PostRepository } from "@db/post/post_repository.js"
import { isExpressError, ExpressError } from "@src/errors.js"
import { makeEditPostService } from "@business/post/edit_post/edit_post_service.js"
import { userIdExists } from "@business/post/edit_post/edit_post_controller_aux.js"

export function makeEditPostRouter(postRepo: PostRepository) {
  const editPostService = makeEditPostService(postRepo)

  return Router().put("/:id", async (req: Request<{ id: number }, object, { mPost: string }>, res) => {
    const { id } = req.params
    const { mPost } = req.body
    const userId = req.userId

    try {
      await editPostService.editPost({ id, mPost, userId: userIdExists(userId) })
      res.status(200).json({ message: "Post edited" })
    } catch (error) {
      if (isExpressError(error as Error)) {
        res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
      } else {
        res.status(500).json({ error: (error as Error).message })
      }
    }
  })
}
