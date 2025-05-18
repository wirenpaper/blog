export interface CommentModel {
  id?: number
  mComment: string
  userId?: number
  postId: number
}

export function createComment(comment: CommentModel): CommentModel {
  const {
    id,
    mComment,
    userId,
    postId
  } = comment

  return {
    id,
    mComment,
    userId,
    postId
  }
}
