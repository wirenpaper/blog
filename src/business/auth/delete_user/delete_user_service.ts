import { UserRepository } from "@db/user/user_repository.js"

interface DeleteUserParams {
  userId: number,
}

export interface DeleteUserService {
  deleteUser: (params: DeleteUserParams) => Promise<void>
}

export function makeDeleteUserService(userRepo: UserRepository): DeleteUserService {
  return {
    async deleteUser({ userId }) {
      await userRepo.deleteUserById({ userId })
    }
  }
}
