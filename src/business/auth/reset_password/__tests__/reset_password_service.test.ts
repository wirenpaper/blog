import bcrypt from "bcrypt"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { makeResetPasswordService } from "@business/auth/reset_password/reset_password_service.js"

jest.mock("bcrypt")

describe("makeResetPasswordService", () => {
  describe("resetPassword", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (bcrypt.hash as jest.Mock).mockReset()
    })

    it("Success", async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123")

      mockUserRepo.getResetToken.mockResolvedValue({
        id: 123,
        resetToken: "reset_token_123"
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      // Act
      const result = await makeResetPasswordService(mockUserRepo).resetPassword({
        userName: "jimbo",
        resetToken: "reset_token_123",
        newPassword: "K!m1@2025#P@ssw0rd$"
      })

      // Assert
      expect(result).toEqual({
        message: "Password successfully reset"
      })
    })

    it("!user", async () => {
      // Arrange
      mockUserRepo.getResetToken.mockResolvedValue(undefined)

      // Act & Assert
      await expect(makeResetPasswordService(mockUserRepo).resetPassword({
        userName: "jimbo",
        resetToken: "reset_token_123",
        newPassword: "K!m1@2025#P@ssw0rd$"
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid or expired token"
      })
    })

    it("!tokenValid", async () => {
      // Arrange
      mockUserRepo.getResetToken.mockResolvedValue({
        id: 123,
        resetToken: "reset_token_123"
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false)

      // Act & Assert
      await expect(makeResetPasswordService(mockUserRepo).resetPassword({
        userName: "jimbo",
        resetToken: "reset_token_123",
        newPassword: "K!m1@2025#P@ssw0rd$"
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid or expired token"
      })
    })

  })
})
