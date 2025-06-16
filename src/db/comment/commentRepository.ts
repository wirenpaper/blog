import { PostgresClient } from "@src/db.js"
import { CommentModel } from "@db/comment/commentModel.js"
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
  userId: number
  commentId: number
}

export interface GetPostCommentsSpecifications {
  getPostComments: (params: { postId: number }) => Promise<GetPostCommentResult[]>
}

export interface CheckCommentPostOwnershipParams {
  userId: number
  mPost: string
  mComment: string
}

export interface CommentRepository extends CreateComment, GetPostCommentsSpecifications {
  checkCommentOwnership: (params: CheckCommentOwnershipParams) => Promise<CheckCommentOwnershipResult>
  checkCommentPostOwnership: (params: { id: number }) => Promise<CheckCommentPostOwnershipParams>
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

    async checkCommentPostOwnership({ id }) {
      try {
        const result: CheckCommentPostOwnershipParams[] = await sqlClient`
            SELECT
              posts.user_id as \"userId\",
              posts.post as \"mPost\",
              comments.comment as \"mComment\"
            FROM
              posts
            JOIN
              comments on posts.id = comments.post_id
            WHERE
              comments.id = ${id}
        `
        if (result.length < 1)
          throw createExpressError(500, "fatal error, post does not exist")
        if (result.length > 1)
          throw createExpressError(500, "fatal error, same comment (id) on multiple posts?!")

        return result[0]
      } catch (error) {
        if (isExpressError(error as Error))
          throw error

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
                c.user_id as \"userId\",
                u.user_name as \"userName\"
              FROM
                comments c
              LEFT JOIN
                users u ON c.user_id = u.id
              WHERE
                c.id = ${id}
            `

        if (row.length !== 1)
          throw createExpressError(500, "should be 1 row exactly")

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
        const res: { id: number }[] = await sqlClient`
          update comments set comment = ${mComment} where id = ${id}
          returning id
        `
        if (res.length < 1)
          throw createExpressError(500, "comment does not exist")

      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async deleteComment({ id }) {
      try {
        const res: { id: number }[] = await sqlClient`
            delete from comments where ${id} = id
            returning id
        `
        if (res.length < 1) {
          throw createExpressError(500, "comment does not exist")
        }

      } catch (error) {
        if (isExpressError(error as Error))
          throw error

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
