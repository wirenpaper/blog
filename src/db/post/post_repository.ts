import { PostgresClient } from "@src/db.js"
import { PostModel } from "@db/post/post_model.js"
import { PostgressDBError } from "@src/errors.js"

export interface GetPostResult {
  id: number,
  mPost: string,
  userId: number,
  userName: string
}

interface EditPostByIdParams {
  id: number
  mPost: string
}

export interface CheckPostOwnershipParams {
  id: number,
  userId: number
}

export interface PostRepository {
  createPost: (params: PostModel) => Promise<PostModel | undefined>
  getPosts: (params: void) => Promise<GetPostResult[]>
  getPostById: (params: { id: number }) => Promise<GetPostResult | undefined>
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
        const [row]: [PostModel | undefined] = await sqlClient`
          insert into posts(post, user_id)
          values(${mPost}, ${userId})
          returning id, post as "mPost", user_id as "userId"
        `
        return row
      } catch (error) {
        throw new PostgressDBError(error, this.createPost)
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
        throw new PostgressDBError(error, this.getPosts)
      }
    },

    async getPostById({ id }) {
      try {
        const [row]: [GetPostResult | undefined] = await sqlClient`
        select p.id, p.post as "mPost", p.user_id as "userId", u.user_name as "userName"
        from posts p
        join users u ON u.id = p.user_id
        where p.id = ${id}
        `
        return row
      } catch (error) {
        throw new PostgressDBError(error, this.getPostById)
      }
    },

    async checkPostOwnership({ id, userId }) {
      try {
        const [row]: [CheckPostOwnershipParams | undefined] = await sqlClient`
          select id from posts where user_id = ${userId} and id = ${id}
        `
        return row
      } catch (error) {
        throw new PostgressDBError(error, this.checkPostOwnership)
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
        throw new PostgressDBError(error, this.editPostById)
      }
    },

    async deletePostById({ id }) {
      try {
        await sqlClient`
          delete from posts
          where id = ${id}
        `
      } catch (error) {
        throw new PostgressDBError(error, this.deletePostById)
      }
    }
  }
}
