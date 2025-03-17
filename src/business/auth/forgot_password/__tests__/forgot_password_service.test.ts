import bcrypt from "bcrypt"
import crypto from "crypto"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { makeForgotPasswordService } from "@business/auth/forgot_password/forgot_password_service.js"

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
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.from("c2d0", "hex"))

      // Act
      const result = await makeForgotPasswordService(mockUserRepo).forgotPassword({
        userName: "jimbo"
      })

      // Assert
      expect(result).toMatchObject({
        message: "Reset instructions sent",
        resetToken: "c2d0"
      })
    })
  })
})
