import { Router, Request } from "express"
import { PostRepository } from "@db/post/post_repository.js"
import { makeDeletePostService } from "@business/post/delete_post/delete_post_service.js"
import { isExpressError, ExpressError } from "@src/errors.js"
// import { userIdExists } from "@business/post/delete_post/delete_post_controller_aux.js"

export function makeDeletePostRouter(repo: PostRepository) {
  const deletePostService = makeDeletePostService(repo)

  return Router().delete("/:id", async (req: Request<{ id: number }, object, object>, res) => {
    const { id } = req.params
    try {
      // userIdExists(req.userId)
      await deletePostService.deletePost({ id, userId: req.userId })
      res.json({ message: "Post deleted" })
    } catch (error) {
      if (isExpressError(error as Error)) {
        res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
      } else {
        res.status(500).json({ error: (error as Error).message })
      }
    }
  })
}
