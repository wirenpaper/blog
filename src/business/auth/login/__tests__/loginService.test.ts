import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { mockUserRepo } from "@db/user/__mocks__/userRepository.mock.js"
import { makeLoginService } from "@business/auth/login/loginService.js"

jest.mock("bcrypt")
jest.mock("jsonwebtoken")

describe("makeLoginService", () => {
  describe("loginUser", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (bcrypt.hash as jest.Mock).mockReset();
      (jwt.sign as jest.Mock).mockReset()
      process.env.JWT_SECRET = "process.env.JWT_SECRET.token"
    })

    it("Success", async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123");
      (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")

      mockUserRepo.getUserByUsername.mockResolvedValue({
        id: 32,
        userName: "jimbo",
        hashedPassword: "*MOCKED*", // actual value doesnt matter here
        firstName: "Jim",
        lastName: "Bo"
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      // Act
      const result = await makeLoginService(mockUserRepo).loginUser({
        userName: "jimbo",
        password: "Ku3!!$jLs__ff"
      })

      // Assert
      expect(result).toEqual({
        token: "test.jwt.token",
        userWithoutPassword: { id: 32, userName: "jimbo", firstName: "Jim", lastName: "Bo" }
      })

    })

    it("!user", async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123");
      (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")

      mockUserRepo.getUserByUsername.mockResolvedValue(undefined)

      // Act & Assert
      await expect(makeLoginService(mockUserRepo).loginUser({
        userName: "jimbo",
        password: "Ku3!!$jLs__ff"
      })).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid username/password"
      })

    })

    it("!passwordIsValid", async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123");
      (jwt.sign as jest.Mock).mockReturnValue("test.jwt.token")

      mockUserRepo.getUserByUsername.mockResolvedValue({
        id: 32,
        userName: "jimbo",
        hashedPassword: "*MOCKED*", // actual value doesnt matter here
        firstName: "Jim",
        lastName: "Bo"
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false)

      // Act & Assert
      await expect(makeLoginService(mockUserRepo).loginUser({
        userName: "jimbo",
        password: "Ku3!!$jLs__ff"
      })).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid username/password"
      })

    })

  })
})
