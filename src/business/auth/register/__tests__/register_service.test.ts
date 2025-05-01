import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { makeRegisterService } from "@business/auth/register/register_service.js"

jest.mock("bcrypt")
jest.mock("jsonwebtoken")

describe("makeRegisterService", () => {
  describe("registerUser", () => {

    beforeEach(() => {
      jest.clearAllMocks();
      (bcrypt.hash as jest.Mock).mockReset();
      (jwt.sign as jest.Mock).mockReset()
      process.env.JWT_SECRET = "process.env.JWT_SECRET.token"
    })

    it("Success", async () => {
      // Arrange
      // jest.spyOn(userModel, "isValidPassword").mockReturnValue(true); <-- useful function to remember
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123");
      (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")

      mockUserRepo.createUser.mockResolvedValue({
        id: 123,
        userName: "testuser",
        hashedPassword: "*MOCKED*", // The actual value here doesn't matter
        firstName: "John",
        lastName: "Doe"
      })

      // Act
      const result = await makeRegisterService(mockUserRepo).registerUser({
        userName: "testuser",
        password: "Ku3!!$jLs__ff",
        firstName: "John",
        lastName: "Doe"
      })

      // Assert
      expect(mockUserRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          hashedPassword: "hashed_123", // Must match bcrypt's response!!
        })
      )
      expect(result).toEqual({
        token: "test.jwt.token",
        user: {
          id: 123,
          userName: "testuser",
          firstName: "John",
          lastName: "Doe"
        }
      })
    })

    it("Invalid password", async () => {
      // Arrange
      // jest.spyOn(userModel, "isValidPassword").mockReturnValue(true); <-- useful function
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123");
      (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")

      mockUserRepo.createUser.mockResolvedValue({
        id: 123,
        userName: "testuser",
        hashedPassword: "*MOCKED*", // The actual value here doesn't matter
        firstName: "John",
        lastName: "Doe"
      })

      // Act & Assert
      await expect(makeRegisterService(mockUserRepo).registerUser({
        userName: "testuser",
        password: "pass",
        firstName: "John",
        lastName: "Doe"
      })).rejects.toMatchObject({
        statusCode: 422,
        message: "Password does not meet requirements"
      })
    })

    it("Token failure", async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123")
      delete process.env.JWT_SECRET

      mockUserRepo.createUser.mockResolvedValue({
        id: 123,
        userName: "testuser",
        hashedPassword: "*MOCKED*", // The actual value here doesn't matter
        firstName: "John",
        lastName: "Doe"
      })

      // Act & Assert
      await expect(makeRegisterService(mockUserRepo).registerUser({
        userName: "testuser",
        password: "K!m1@2025#P@ssw0rd$",
        firstName: "John",
        lastName: "Doe"
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "process.env.JWT_SECRET is undefined"
      })
    })

  })
})
