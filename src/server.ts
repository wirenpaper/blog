import express from "express"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import sql from "./db.js"

////////////////////////////////////////////////////////////////////////////////////
/////////// AUTH ROUTER IMPORTS
////////////////////////////////////////////////////////////////////////////////////
import { makeRegisterRouter } from "@business/auth/register/register_controller.js"
import { makeLoginRouter } from "@business/auth/login/login_controller.js"
import { makeLogoutRouter } from "@business/auth/logout/logout_controller.js"
import { makeForgotPasswordRouter } from "@business/auth/forgot_password/forgot_password_controller.js"
import { makeVerifyResetTokenRouter } from "@business/auth/verify_reset_token/verify_reset_token_controller.js"
import { makeResetPasswordRouter } from "@business/auth/reset_password/reset_password_controller.js"
import { makeChangePasswordLoggedInRouter } from
  "@business/auth/change_password_logged_in/change_password_logged_in_controller.js"
import { makeDeleteUserRouter } from "@business/auth/delete_user/delete_user_controller.js"

///////////////////////////////////////////////////////////////////////////////////
//////// POST ROUTER IMPORTS
///////////////////////////////////////////////////////////////////////////////////
import { makePostRouter } from "@business/post/create_post/create_post_controller.js"
import { makeReadPostsRouter } from "@business/post/read_posts/read_posts_controller.js"
import { makeReadPostRouter } from "@business/post/read_post/read_post_controller.js"
import { makeEditPostRouter } from "@business/post/edit_post/edit_post_controller.js"
import { makeDeletePostRouter } from "@business/post/delete_post/delete_post_controller.js"

///////////////////////////////////////////////////////////////////////////////////
//////// COMMENT ROUTER IMPORTS
///////////////////////////////////////////////////////////////////////////////////
import { makeCreateCommentRouter } from "@business/comment/create_comment/create_comment_controller.js"
import { makeEditCommentRouter } from "@business/comment/edit_comment/edit_comment_controller.js"
import { makeDeleteCommentRouter } from "@business/comment/delete_comment/delete_comment_controller.js"
import { makeGetPostCommentsRouter } from "@business/comment/get_post_comments/get_post_comments_controller.js"

// REPOSITORIES ////////////////////////////////////////////////////////////////////
import { userRepository } from "@db/user/user_repository.js"
import { postRepository } from "@db/post/post_repository.js"
import { commentRepository } from "@db/comment/comment_repository.js"
////////////////////////////////////////////////////////////////////////////////////

// middleware ///////////
import authMiddleware from "@middleware/authMiddleware.js"
import { makeEmailClient } from "./email_client.js"
/////////////////////////

const app = express()
const PORT = process.env.PORT ?? 5003

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize dependencies
const userRepo = userRepository(sql)
const postRepo = postRepository(sql)
const commentRepo = commentRepository(sql)

const emailConfig = {
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT!),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!
  },
  from: process.env.FROM_EMAIL!
}
const emailClient = makeEmailClient(emailConfig)

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, "../public")))

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// AUTH ROUTES
////////////////////////////////////////////////////////////////////////////////////////////////////
app.use("/auth/register", makeRegisterRouter(userRepo))
app.use("/auth/login", makeLoginRouter(userRepo))
app.use("/auth/logout", makeLogoutRouter())
app.use("/auth/forgot-password", makeForgotPasswordRouter(userRepo, emailClient))
app.use("/auth/verify-reset-token", makeVerifyResetTokenRouter(userRepo))
app.use("/auth/reset-password", makeResetPasswordRouter(userRepo))
app.use("/auth/change-password-logged-in", authMiddleware, makeChangePasswordLoggedInRouter(userRepo))
app.use("/auth/delete-user", authMiddleware, makeDeleteUserRouter(userRepo))

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// POST ROUTES
/////////////////////////////////////////////////////////////////////////////////////////////////////
app.use("/posts/create", authMiddleware, makePostRouter(postRepo))
app.use("/posts/read-all", makeReadPostsRouter(postRepo))
app.use("/posts/read", makeReadPostRouter(postRepo))
app.use("/posts/edit", authMiddleware, makeEditPostRouter(postRepo))
app.use("/posts/delete", authMiddleware, makeDeletePostRouter(postRepo))

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// COMMENT ROUTES
/////////////////////////////////////////////////////////////////////////////////////////////////////
app.use("/comments/create", authMiddleware, makeCreateCommentRouter(commentRepo))
app.use("/comments/edit", authMiddleware, makeEditCommentRouter(commentRepo))
app.use("/comments/delete", authMiddleware, makeDeleteCommentRouter(commentRepo))
app.use("/comments/read-post-comments", makeGetPostCommentsRouter(commentRepo))

app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`)
})
