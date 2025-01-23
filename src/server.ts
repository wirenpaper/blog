import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import sql from "./db.js"

////////////////////////////////////////////////////////////////////////////////////
/////////// AUTH ROUTER IMPORTS
////////////////////////////////////////////////////////////////////////////////////
import { makeRegisterRouter } from './business/auth/register/register_request.js'
import { makeLoginRouter } from "./business/auth/login/login_request.js"
import { makeLogoutRouter } from './business/auth/logout/logout_request.js'
import { makeForgotPasswordRouter } from "./business/auth/forgot_password/forgot_password_request.js"
import { makeVerifyResetTokenRouter } from "./business/auth/verify_reset_token/verify_reset_token_request.js"
import { makeResetPasswordRouter } from "./business/auth/reset_password/reset_password_request.js"
import { makeChangePasswordLoggedInRouter } from "./business/auth/change_password_logged_in/change_password_logged_in_request.js"

///////////////////////////////////////////////////////////////////////////////////
//////// POST ROUTER IMPORTS
///////////////////////////////////////////////////////////////////////////////////
import { makePostRouter } from "./business/post/create_post/create_post_request.js"
import { makeReadPostsRouter } from "./business/post/read_posts/read_posts_request.js"
import { makeReadPostRouter } from "./business/post/read_post/read_post_request.js"
import { makeEditPostRouter } from "./business/post/edit_post/edit_post_request.js"
import { makeDeletePostRouter } from "./business/post/delete_post/delete_post_request.js"

///////////////////////////////////////////////////////////////////////////////////
//////// COMMENT ROUTER IMPORTS
///////////////////////////////////////////////////////////////////////////////////
import { makeCreateCommentRouter } from './business/comment/create_comment/create_comment_request.js'
import { makeEditCommentRouter } from './business/comment/edit_comment/edit_comment_request.js'
import { makeDeleteCommentRouter } from './business/comment/delete_comment/delete_comment_request.js'
import { makeGetPostCommentsRouter } from './business/comment/get_post_comments/get_post_comments_request.js'

// REPOSITORIES ////////////////////////////////////////////////////////////////////
import { userRepository } from './db/user/user_repository.js'
import { postRepository } from './db/post/post_repository.js'
import { commentRepository } from './db/comment/comment_repository.js'
////////////////////////////////////////////////////////////////////////////////////

// middleware ///////////
import authMiddleware from './middleware/authMiddleware.js'
/////////////////////////

const app = express()
const PORT = process.env.PORT ?? 5003

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize dependencies
const userRepo = userRepository(sql)
const postRepo = postRepository(sql)
const commentRepo = commentRepository(sql)

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// AUTH ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////////
const registerRouter = makeRegisterRouter(userRepo)  // Use makeRegisterRouter instead
app.use('/auth/register', registerRouter)
const loginRouter = makeLoginRouter(userRepo)
app.use("/auth/login", loginRouter)
const logoutRouter = makeLogoutRouter()
app.use("/auth/logout", logoutRouter)
const forgotPasswordRouter = makeForgotPasswordRouter(userRepo)
app.use("/auth/forgot-password", forgotPasswordRouter)
const verifyResetTokenRouter = makeVerifyResetTokenRouter(userRepo)
app.use("/auth/verify-reset-token", verifyResetTokenRouter)
const resetPasswordRouter = makeResetPasswordRouter(userRepo)
app.use("/auth/reset-password", resetPasswordRouter)
const changePasswordLoggedInRouter = makeChangePasswordLoggedInRouter(userRepo)
app.use("/auth/change-password-logged-in", changePasswordLoggedInRouter)

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// POST ROUTES
/////////////////////////////////////////////////////////////////////////////////////////////////////
const postRouter = makePostRouter(postRepo)
app.use("/posts/create", authMiddleware, postRouter)
const readPostsRouter = makeReadPostsRouter(postRepo)
app.use("/posts/read", authMiddleware, readPostsRouter)
const readPostRouter = makeReadPostRouter(postRepo)
app.use("/posts/read", authMiddleware, readPostRouter)
const editPostRouter = makeEditPostRouter(postRepo)
app.use("/posts/edit", authMiddleware, editPostRouter)
const deletePostRouter = makeDeletePostRouter(postRepo)
app.use("/posts/delete", authMiddleware, deletePostRouter)

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// COMMENT ROUTES
/////////////////////////////////////////////////////////////////////////////////////////////////////
const createCommentRouter = makeCreateCommentRouter(commentRepo)
app.use("/comments/create", authMiddleware, createCommentRouter)
const editCommentRouter = makeEditCommentRouter(commentRepo)
app.use("/comments/edit", authMiddleware, editCommentRouter)
const deleteCommentRouter = makeDeleteCommentRouter(commentRepo)
app.use("/comments/delete", authMiddleware, deleteCommentRouter)
const getPostCommentsRouter = makeGetPostCommentsRouter(commentRepo)
app.use("/posts/comments", getPostCommentsRouter)

app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`)
})
