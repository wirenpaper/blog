export interface PostModel {
  id?: number
  mPost: string
  userId: number
}

export function createPost(post: PostModel): PostModel {
  const {
    id,
    mPost,
    userId,
  } = post

  return {
    id,
    mPost,
    userId,
  }
}
