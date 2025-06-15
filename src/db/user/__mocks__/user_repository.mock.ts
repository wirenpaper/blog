import { UserRepository } from "@db/user/user_repository.js"

export const mockUserRepo: jest.Mocked<UserRepository> = {
  createUser: jest.fn(),
  getUserByUsername: jest.fn(),
  getUserById: jest.fn(),
  updateUserResetToken: jest.fn(),
  getResetToken: jest.fn(),
  updateUserPassword: jest.fn(),
  updateLoggedInUserPassword: jest.fn(),
  deleteUserById: jest.fn()
}
