import { PostgresClient } from "@src/db.js"
import { CommentModel } from "@db/comment/comment_model.js"
import { createExpressError, isExpressError, postgresStatusCode } from "@src/errors.js"

export interface CheckCommentOwnershipParams {
  id: number
  userId: number
}

export interface CreateComment {
  createComment: (params: CommentModel) => Promise<void>
}

export interface GetPostCommentResult {
  id: number
  mComment: string
}

export interface GetPostCommentsSpecifications {
  getPostComments: (params: { postId: number }) => Promise<GetPostCommentResult[]>
}

export interface CommentRepository extends CreateComment, GetPostCommentsSpecifications {
  checkCommentOwnership: (params: CheckCommentOwnershipParams) => Promise<{ id: number } | undefined>
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

    async checkCommentOwnership({ id, userId }) {
      try {
        const row: { id: number }[] = await sqlClient`
          select id from comments where ${id} = id and ${userId} = user_id
        `
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
          select id, comment as "mComment" from comments where post_id = (
            select id from posts where id = ${postId}
          )
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
