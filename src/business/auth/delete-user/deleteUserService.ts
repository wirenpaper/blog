import { UserRepository } from "@db/user/userRepository.js"

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
