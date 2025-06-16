import { PostgresClient } from "@src/db.js"
import { PostModel } from "@db/post/postModel.js"
import { createExpressError, isExpressError, postgresStatusCode } from "@src/errors.js"

export interface CheckPostOwnershipResult {
  userId?: number,
  id: number
}

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

export interface PostRepository {
  createPost: (params: PostModel) => Promise<PostModel>
  getPosts: (params: void) => Promise<GetPostResult[]>
  getPostById: (params: { id: number }) => Promise<GetPostResult>
  checkPostOwnership: (params: { id: number }) => Promise<CheckPostOwnershipResult>
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
        const row: PostModel[] = await sqlClient`
          insert into posts(post, user_id)
          values(${mPost}, ${userId})
          returning id, post as "mPost", user_id as "userId"
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

    async checkPostOwnership({ id }) {
      try {
        const row: CheckPostOwnershipResult[] = await sqlClient`
          SELECT
            p.user_id as "userId",    -- Select user_id from posts table (aliased as p)
            u.user_name as "userName"  -- Select user_name from users table (aliased as u)
          FROM
            posts p       -- From the posts table, aliased as 'p'
          JOIN
            users u ON p.user_id = u.id -- INNER JOIN users table (aliased as 'u')
                                      -- ON the condition that post's user_id matches user's id
          WHERE
            p.id = ${id}  -- Filter for the specific post ID
        `

        if (row.length < 1)
          throw createExpressError(500, "no results")

        if (row.length > 1)
          throw createExpressError(500, "fatal error; multiple results")

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
        const res: { id: number }[] = await sqlClient`
          update posts
          set post = ${mPost}
          where id = ${id}
          returning id
        `
        if (res.length < 1)
          throw createExpressError(500, "no results")

      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    },

    async deletePostById({ id }) {
      try {
        const res: { id: number }[] = await sqlClient`
          delete from posts
          where id = ${id}
          returning id
        `
        if (res.length < 1)
          throw createExpressError(500, "no results")

      } catch (error) {
        if (isExpressError(error as Error))
          throw error

        const e = error as { code?: string; message: string }
        if (!e.code)
          throw createExpressError(500, "STATUSCODE NOT FOUND " + e.message)

        throw createExpressError(postgresStatusCode(e.code), e.message)
      }
    }
  }
}
