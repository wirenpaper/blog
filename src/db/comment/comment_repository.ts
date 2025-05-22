import { PostgresClient } from "@src/db.js"
import { CommentModel } from "@db/comment/comment_model.js"
import { createExpressError, isExpressError, postgresStatusCode } from "@src/errors.js"

export interface CheckCommentOwnershipParams {
  id: number
}

export interface CheckCommentOwnershipResult {
  userId: number
  userName: string
}

export interface CreateComment {
  createComment: (params: CommentModel) => Promise<void>
}

export interface GetPostCommentResult {
  userName: string
  mComment: string
  userId: number,
  commentId: number
}

export interface GetPostCommentsSpecifications {
  getPostComments: (params: { postId: number }) => Promise<GetPostCommentResult[]>
}


export interface CommentRepository extends CreateComment, GetPostCommentsSpecifications {
  checkCommentOwnership: (params: CheckCommentOwnershipParams) => Promise<CheckCommentOwnershipResult>
  editComment: (params: { id: number, mComment: string }) => Promise<void>
  deleteComment: (params: { id: number }) => Promise<void>
}

export function commentRepository(sqlClient: PostgresClient): CommentRepository {
  return {
    async createComment({
      mComment,
      userId,
      postId
    }) {
      try {
        await sqlClient`
          insert into comments (comment, user_id, post_id)
          values(${mComment}, ${userId}, ${postId})
          returning id, comment as "mComment", user_id as "userId", post_id as "postId"
        `
      } catch (error) {
        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async checkCommentOwnership({ id }) {
      try {
        const row: CheckCommentOwnershipResult[] = await sqlClient`
          SELECT
            c.user_id as "userId",
            u.user_name as "userName"
          FROM
            comments c
          LEFT JOIN
            users u ON c.user_id = u.id
          WHERE
            c.id = ${id}
        `
        if (row.length < 1)
          throw createExpressError(500, "no owner")
        if (row.length > 1)
          throw createExpressError(500, "should be 0 or 1 rows")

        return row[0]
      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }

        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },


    async editComment({ id, mComment }) {
      try {
        await sqlClient`
          update comments set comment = ${mComment} where id = ${id}
        `
      } catch (error) {
        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async deleteComment({ id }) {
      try {
        await sqlClient`
          delete from comments where ${id} = id
      `
      } catch (error) {
        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async getPostComments({ postId }) {
      try {
        const rows: GetPostCommentResult[] = await sqlClient`
          SELECT
          u.user_name as \"userName\",
          c.comment AS \"mComment\",
          u.id as \"userId\",
          c.id as \"commentId\"
          FROM
              comments c
          LEFT JOIN
              users u ON c.user_id = u.id
          WHERE
              c.post_id = ${postId}
          `
        return rows
      } catch (error) {
        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    }
  }
}
