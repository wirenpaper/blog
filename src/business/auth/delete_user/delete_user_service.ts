import { UserRepository } from "@db/user/user_repository.js"
import { verifyUser } from "@business/aux.js"

interface DeleteUserParams {
  userId: number,
  id: number
}

export interface DeleteUserService {
  deleteUser: (params: DeleteUserParams) => Promise<void>
}

export function makeDeleteUserService(userRepo: UserRepository): DeleteUserService {
  return {
    async deleteUser({ userId, id }) {
      verifyUser(id, userId)
      await userRepo.deleteUserById({ userId })
    }
  }
}
