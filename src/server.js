import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import sql from "./db.js"
import { userRepository } from "./db/user/repository.js"
import { buildAuthRoutes } from "./routes/authRoutes.js"

import postRoutes from './routes/postRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'

const app = express()
const PORT = process.env.PORT || 5003

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url)
// Get the directory name from the file path
const __dirname = dirname(__filename)

// Middleware
app.use(express.json())
// Serves the HTML file from the /public directory
// Tells express to serve all files from the public folder as static assets / file. Any requests for the css files will be resolved to the public directory.
app.use(express.static(path.join(__dirname, '../public')))

const userRepo = userRepository(sql);
const authRoutes = buildAuthRoutes(userRepo);

// Routes
app.use('/auth', authRoutes)
app.use('/posts', authMiddleware, postRoutes)
app.use('/comments', authMiddleware, commentRoutes)

app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`)
})
