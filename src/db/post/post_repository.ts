import { createPost as createPostModel } from "@db/post/post_model.js"
import { PostgresClient } from "@src/db.js"
import { PostModel } from "@db/post/post_model.js"
import { createExpressError, isExpressError, postgresStatusCode } from "@src/errors.js"

export interface GetPostResult {
  id: number,
  mPost: string,
  userId: number,
  userName: string
}

export interface EditPostByIdParams {
  id: number
  mPost: string
}

export interface CheckPostOwnershipParams {
  id: number,
  userId: number
}

export interface PostRepository {
  createPost: (params: PostModel) => Promise<PostModel>
  getPosts: (params: void) => Promise<GetPostResult[]>
  getPostById: (params: { id: number }) => Promise<GetPostResult>
  checkPostOwnership: (params: CheckPostOwnershipParams) => Promise<{ id: number } | undefined>
  editPostById: (params: EditPostByIdParams) => Promise<void>
  deletePostById: (params: { id: number }) => Promise<void>
}

export function postRepository(sqlClient: PostgresClient): PostRepository {
  return {
    async createPost({
      mPost,
      userId
    }) {
      try {
        const row = await sqlClient`
          insert into posts(post, user_id)
          values(${mPost}, ${userId})
          returning id, post as "mPost", user_id as "userId"
        `
        if (row.length !== 1)
          throw createExpressError(500, "should be *exactly* 1 row")

        return createPostModel(row[0] as PostModel)
      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }

        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async getPosts() {
      try {
        const rows: GetPostResult[] = await sqlClient`
          select p.id as "id", p.post as "mPost", p.user_id as "userId", u.user_name as "userName"
          from posts p
          join users u on u.id = p.user_id
          order by p.id desc
        `
        return rows
      } catch (error) {
        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async getPostById({ id }) {
      try {
        const row: GetPostResult[] = await sqlClient`
        select p.id, p.post as "mPost", p.user_id as "userId", u.user_name as "userName"
        from posts p
        join users u ON u.id = p.user_id
        where p.id = ${id}
        `

        if (row.length !== 1)
          throw createExpressError(500, "should be *exactly* 1 row")

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

    async checkPostOwnership({ id, userId }) {
      try {
        const row: CheckPostOwnershipParams[] = await sqlClient`
          select id from posts where user_id = ${userId} and id = ${id}
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

    async editPostById({ id, mPost }) {
      try {
        await sqlClient`
          update posts
          set post = ${mPost}
          where id = ${id}
        `
      } catch (error) {
        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async deletePostById({ id }) {
      try {
        await sqlClient`
          delete from posts
          where id = ${id}
        `
      } catch (error) {
        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    }
  }
}
