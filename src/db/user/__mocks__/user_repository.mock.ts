import { UserRepository } from "../user_repository.js"

export const mockUserRepo: jest.Mocked<UserRepository> = {
  createUser: jest.fn(),
  getUserByUsername: jest.fn(),
  getUserById: jest.fn(),
  updateUserResetToken: jest.fn(),
  getResetTokens: jest.fn(),
  updateTokenVerified: jest.fn(),
  getUserByVerifiedToken: jest.fn(),
  updateUserPassword: jest.fn(),
  updateLoggedInUserPassword: jest.fn()
}

export function mockUser() {
  mockUserRepo.createUser.mockResolvedValue({
    id: 123,
    userName: "testuser",
    hashedPassword: "hashed_abc123",
    firstName: "John",
    lastName: "Doe"
  })
}

export const testUserData = {
  userName: "testuser",
  password: "pass",
  firstName: "John",
  lastName: "Doe"
}
