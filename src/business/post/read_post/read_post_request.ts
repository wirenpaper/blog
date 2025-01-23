import { PostRepository } from "../../../db/post/post_repository.js";
import { makeReadPostService } from "./read_post_service.js";
import { PostgressDBError, PostError } from "../../../errors.js";
import { Router } from "express";

export function makeReadPostRouter(postRepo: PostRepository) {
  const readPostService = makeReadPostService(postRepo)

  return Router().get("/:id", async (req, res) => {
    const { id } = req.params
    try {
      const post = await readPostService.readPost({ id: Number(id) })
      res.json(post)
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof PostError) {
        const { statusCode, name, func, message } = error
        res.status(statusCode).json({ name, func, message })
      }
      res.status(500).json(error)
    }
  })
}
