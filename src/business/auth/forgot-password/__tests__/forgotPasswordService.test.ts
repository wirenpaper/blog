import bcrypt from "bcrypt"
import crypto from "crypto"
import { mockUserRepo } from "@db/user/__mocks__/userRepository.mock.js"
import { makeForgotPasswordService } from "@business/auth/forgot-password/forgotPasswordService.js"
import { mockEmailClient } from "@src/client/mocks/emailClientMock.js"

jest.mock("bcrypt")
jest.mock("crypto")

describe("makeForgotPasswordService", () => {
  describe("forgotPassword", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (bcrypt.hash as jest.Mock).mockReset();
      (crypto.randomBytes as jest.Mock).mockReset()
    })

    it("Success", async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123")

      mockUserRepo.getUserByUsername.mockResolvedValue({
        id: 32,
        userName: "jimbo",
        hashedPassword: "*MOCKED*", // actual value doesnt matter here
        firstName: "Jim",
        lastName: "Bo"
      })
      mockEmailClient.sendPasswordResetEmail.mockResolvedValue();

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.from("c2d0", "hex"))

      // Act
      const result = await makeForgotPasswordService(mockUserRepo, mockEmailClient).forgotPassword({
        userName: "jimbo"
      })

      // Assert
      expect(result).toMatchObject({
        message: "Check your email"
      })
    })

    it("!user", async () => {
      // Assert
      mockUserRepo.getUserByUsername.mockResolvedValue(undefined)

      // Act & Assert
      await expect(makeForgotPasswordService(mockUserRepo, mockEmailClient).forgotPassword({
        userName: "jimbo",
      })).rejects.toMatchObject({
        statusCode: 200,
        message: "Check your email"
      })
    })
  })
})
