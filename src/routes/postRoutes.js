import express from 'express'
import sql from '../db.js'

const router = express.Router()

// CREATE a new post
router.post('/', async (req, res) => {
  try {
    const { post } = req.body

    // Insert into the posts table, referencing the logged-in user (req.userId)
    const [newPost] = await sql`
      INSERT INTO posts (post, user_id)
      VALUES (${post}, ${req.userId})
      RETURNING id, post, user_id
    `
    res.status(201).json(newPost)
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(500).json({ message: 'Error creating post' })
  }
})

// READ all posts
router.get('/', async (req, res) => {
  try {
    // Get all posts + the username of the user who created them
    const posts = await sql`
      SELECT p.id, p.post, p.user_id, u.username
      FROM posts p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.id DESC
    `
    res.json(posts)
  } catch (error) {
    console.error('Error retrieving posts:', error)
    res.status(500).json({ message: 'Error retrieving posts' })
  }
})

// READ a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [post] = await sql`
      SELECT p.id, p.post, p.user_id, u.username
      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = ${id}
    `
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.json(post)
  } catch (error) {
    console.error('Error retrieving post:', error)
    res.status(500).json({ message: 'Error retrieving post' })
  }
})

// UPDATE a post
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { post } = req.body

    // Only allow updating if the post belongs to the logged-in user
    const [updatedPost] = await sql`
      UPDATE posts
      SET post = ${post}
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id, post, user_id
    `
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found or not yours' })
    }
    res.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    res.status(500).json({ message: 'Error updating post' })
  }
})

// DELETE a post
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Only allow deleting if the post belongs to the logged-in user
    const deletedResult = await sql`
      DELETE FROM posts
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id
    `
    // If no rows were deleted, it means the post either doesn’t exist 
    // or doesn’t belong to the logged-in user.
    if (deletedResult.count === 0) {
      return res.status(404).json({ message: 'Post not found or not yours' })
    }

    res.json({ message: 'Post deleted' })
  } catch (error) {
    console.error('Error deleting post:', error)
    res.status(500).json({ message: 'Error deleting post' })
  }
})

router.get('/comments/:post_id', async (req, res) => {
  try {
    const { post_id } = req.params

    const comments = await sql`
      select * from comments where post_id = (
        select id from posts where id = ${post_id}
      )
    `
    res.status(201).json(comments)
  } catch (error) {
    console.error("Error showing post comments:", error)
    res.status(500).json({ message: "Error showing post commnets" })
  }
})

export default router
