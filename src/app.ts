import express, { Express, ErrorRequestHandler } from "express"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import { Sql } from "postgres"
import { ExpressError } from "@src/errors.js"

////////////////////////////////////////////////////////////////////////////////////
/////////// AUTH ROUTER IMPORTS
////////////////////////////////////////////////////////////////////////////////////
import { makeRegisterRouter } from "@business/auth/register/registerController.js"
import { makeLoginRouter } from "@business/auth/login/loginController.js"
import { makeLogoutRouter } from "@business/auth/logout/logoutController.js"
import { makeForgotPasswordRouter } from "@business/auth/forgot-password/forgotPasswordController.js"
import { makeResetPasswordRouter } from "@business/auth/reset-password/resetPasswordController.js"
import { makeChangePasswordLoggedInRouter } from
  "@business/auth/change-password-logged-in/changePasswordLoggedInController.js"
import { makeDeleteUserRouter } from "@business/auth/delete-user/deleteUserController.js"

///////////////////////////////////////////////////////////////////////////////////
//////// POST ROUTER IMPORTS
///////////////////////////////////////////////////////////////////////////////////
import { makePostRouter } from "@business/post/create-post/createPostController.js"
import { makeReadPostsRouter } from "@business/post/read_posts/read_posts_controller.js"
import { makeReadPostRouter } from "@business/post/read_post/read_post_controller.js"
import { makeEditPostRouter } from "@business/post/edit-post/editPostController.js"
import { makeDeletePostRouter } from "@business/post/delete-post/deletePostController.js"

///////////////////////////////////////////////////////////////////////////////////
//////// COMMENT ROUTER IMPORTS
///////////////////////////////////////////////////////////////////////////////////
import { makeCreateCommentRouter } from "@business/comment/create-comment/createCommentController.js"
import { makeEditCommentRouter } from "@business/comment/edit-comment/editCommentController.js"
import { makeDeleteCommentRouter } from "@business/comment/delete-comment/deleteCommentController.js"
import { makeGetPostCommentsRouter } from "@business/comment/get-post-comments/getPostCommentsController.js"

// REPOSITORIES ////////////////////////////////////////////////////////////////////
import { userRepository } from "@db/user/user_repository.js"
import { postRepository } from "@db/post/post_repository.js"
import { commentRepository } from "@db/comment/comment_repository.js"
////////////////////////////////////////////////////////////////////////////////////

// middleware ///////////
import authMiddleware from "@middleware/authMiddleware.js"
/////////////////////////

// clients //////////////
import { EmailConfig, makeEmailClient } from "@src/client/email_client.js"
/////////////////////////

export function createApp(sql: Sql, emailConfig: EmailConfig): Express {

  const app = express()

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  // Initialize dependencies
  const userRepo = userRepository(sql)
  const postRepo = postRepository(sql)
  const commentRepo = commentRepository(sql)

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
  // app.use("/auth/verify-reset-token", makeVerifyResetTokenRouter(userRepo))
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

  // =========================================================
  // FINAL ERROR HANDLER
  // =========================================================

  const errorHandler: ErrorRequestHandler = (err: ExpressError, _req, res, _next) => {
    let statusCode = 500
    let message = "An unexpected internal server error occurred."

    if (err && typeof err.statusCode === "number" && typeof err.message === "string") {
      statusCode = err.statusCode
      message = err.message
    }

    if (statusCode === 500) {
      console.error("UNHANDLED ERROR:", err)
    }

    res.status(statusCode).json({
      error: {
        message: message,
      },
    })
  }

  app.use(errorHandler)

  return app
}
