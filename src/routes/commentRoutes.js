import express from "express"
import sql from "../db.js"

const router = express.Router()

// CREATE a new comment
router.post("/", async (req, res) => {
  try {
    const { comment, post_id } = req.body

    // Insert into the comments table, referencing the logged-in user (req.userId) and also the post_id
    const [newComment] = await sql`
      insert into comments (comment, user_id, post_id)
      values (${comment}, ${req.userId}, ${post_id})
      returning *
    `
    res.status(201).json(newComment)
  } catch (error) {
    console.log("Error creating comment:", error)
    res.status(500).json({ message: "Error creating comment" })
  }
})

// READ all comments
router.get("/", async (req, res) => {
  try {
    const comments = await sql`
      select id, comment, user_id, post_id
      from comments
      where user_id = ${req.userId}
    `
    res.status(201).json(comments)
  } catch (error) {
    console.log("Error reading comments:", error)
    res.status(500).json({ message: "Error reading comments" })
  }
})

export default router
