import bcrypt from "bcrypt"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { makeVerifyResetTokenService } from "@business/auth/verify_reset_token/verify_reset_token_service.js"

jest.mock("bcrypt")


describe("makeLoginService", () => {
  describe("loginUser", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (bcrypt.hash as jest.Mock).mockReset()
    })

    it("Success; single reset token", async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123")

      mockUserRepo.getResetTokens.mockResolvedValue([
        { id: 123, resetToken: "reset_token_123" }
      ]);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      // Act
      const result = await makeVerifyResetTokenService(mockUserRepo).verifyResetToken({
        resetToken: "reset_token_123"
      })

      // Assert
      expect(result).toEqual({
        "message": "Token verified, proceed to password reset"
      })
    })

    it("Success; multiple reset tokens", async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123")

      mockUserRepo.getResetTokens.mockResolvedValue([
        { id: 123, resetToken: "reset_token_123" },
        { id: 124, resetToken: "reset_token_124" }
      ]);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      // Act
      const result = await makeVerifyResetTokenService(mockUserRepo).verifyResetToken({
        resetToken: "reset_token_123"
      })

      // Assert
      expect(result).toEqual({
        "message": "Token verified, proceed to password reset"
      })
    })

    it("users === 0", async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123")
      mockUserRepo.getResetTokens.mockResolvedValue([]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      // Act & Assert
      await expect(makeVerifyResetTokenService(mockUserRepo).verifyResetToken({
        resetToken: "reset_token_123"
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "No reset tokens found"
      })
    })

    it("!user", async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_123")
      mockUserRepo.getResetTokens.mockResolvedValue([
        { id: 123, resetToken: "reset_token_123" }
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false)

      // Act & Assert
      await expect(makeVerifyResetTokenService(mockUserRepo).verifyResetToken({
        resetToken: "reset_token_123"
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "Invalid or expired token"
      })
    })

  })
})
