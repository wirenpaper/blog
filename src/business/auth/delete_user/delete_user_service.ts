import { UserRepository } from "@db/user/user_repository.js"
import { verifyUser } from "@business/aux.js"

interface DeleteUserParams {
  userId: number,
  id: number
}

export interface DeleteUserService {
  deletePost: (params: DeleteUserParams) => Promise<void>
}

export function makeDeletePostService(userRepo: UserRepository): DeleteUserService {
  return {
    async deletePost({ userId, id }) {
      verifyUser(id, userId)
      await userRepo.deleteUserById({ userId })
    }
  }
}
