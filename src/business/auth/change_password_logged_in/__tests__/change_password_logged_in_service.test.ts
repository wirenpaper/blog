import bcrypt from "bcrypt"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { makeChangePasswordLoggedInService } from
  "@business/auth/change_password_logged_in/change_password_logged_in_service.js"

jest.mock("bcrypt")

describe("makeLoginService", () => {
  describe("loginUser", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (bcrypt.hash as jest.Mock).mockReset()
    })

    it("Success", async () => {
      // Arrange
      mockUserRepo.getUserById.mockResolvedValue({
        id: 32,
        hashedPassword: "*MOCKED*"
      })
      mockUserRepo.updateLoggedInUserPassword.mockResolvedValue(undefined);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      // Act
      // *MOCKED*
      const result = await makeChangePasswordLoggedInService(mockUserRepo).changePasswordLoggedIn({
        currentPassword: "K!m1@2025#P@ssw0rd$",
        newPassword: "X7!k#9Lm@pQ2z$",
        userId: 123
      })

      // Assert
      expect(result).toMatchObject({
        message: "Password successfully changed"
      })
    })

    it("!user.hashedPassword", async () => {
      // Arrange
      mockUserRepo.getUserById.mockResolvedValue({
        id: 32,
        hashedPassword: null
      })

      // Act & Assert
      // *MOCKED*
      await expect(makeChangePasswordLoggedInService(mockUserRepo).changePasswordLoggedIn({
        currentPassword: "K!m1@2025#P@ssw0rd$",
        newPassword: "X7!k#9Lm@pQ2z$",
        userId: 123
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "User has no password"
      })
    })

    it("!passwordIsValid", async () => {
      // Arrange
      mockUserRepo.getUserById.mockResolvedValue({
        id: 32,
        hashedPassword: "*MOCKED*"
      })
      mockUserRepo.updateLoggedInUserPassword.mockResolvedValue(undefined);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false)

      // Act
      // *MOCKED*
      await expect(makeChangePasswordLoggedInService(mockUserRepo).changePasswordLoggedIn({
        currentPassword: "K!m1@2025#P@ssw0rd$",
        newPassword: "X7!k#9Lm@pQ2z$",
        userId: 123
      })).rejects.toMatchObject({
        statusCode: 401,
        message: "Current password is incorrect"
      })

    })
  })
})
