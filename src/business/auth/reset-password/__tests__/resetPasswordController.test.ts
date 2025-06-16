import express from "express"
import supertest from "supertest"
import { makeResetPasswordRouter, ResetPasswordRequest } from
  "@business/auth/reset-password/resetPasswordController.js"
import { MakeResetPasswordService, makeResetPasswordService } from
  "@business/auth/reset-password/resetPasswordService.js"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/auth/reset-password/resetPasswordService.js", () => ({
  makeResetPasswordService: jest.fn()
}))


describe("makeLoginRouter", () => {
  describe("POST /", () => {
    let app: express.Express
    const mockResetPassword: jest.Mocked<MakeResetPasswordService> = {
      resetPassword: jest.fn()
    }

    beforeAll(() => {
      (makeResetPasswordService as jest.Mock).mockReturnValue(mockResetPassword)
      const router = makeResetPasswordRouter(mockUserRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      mockResetPassword.resetPassword.mockResolvedValue({
        message: "Password successfully reset"
      })

      const requestData: ResetPasswordRequest = {
        userName: "lolcat",
        newPassword: "X7!k#9Lm@pQ2z$",
        resetToken: "reset_token_123"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: "Password successfully reset"
      })
    })

    it("Failure; empty userName", async () => {
      mockResetPassword.resetPassword.mockResolvedValue({
        message: "Password successfully reset"
      })

      const requestData: ResetPasswordRequest = {
        userName: "",
        newPassword: "X7!k#9Lm@pQ2z$",
        resetToken: "reset_token_123"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ message: "User name cannot be empty." })
    })

    it("Failure; resetToken cannot be empty", async () => {
      mockResetPassword.resetPassword.mockResolvedValue({
        message: "Password successfully reset"
      })

      const requestData: ResetPasswordRequest = {
        userName: "lolcat",
        newPassword: "X7!k#9Lm@pQ2z$",
        resetToken: ""
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Reset token cannot be empty."
      })
    })

    it("Failure; newPassword too short", async () => {
      mockResetPassword.resetPassword.mockResolvedValue({
        message: "Password successfully reset"
      })

      const requestData: ResetPasswordRequest = {
        userName: "lolcat",
        newPassword: "1234567",
        resetToken: "reset_token_123"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "New password must be between 8 and 128 characters., New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
      })
    })

    it("Failure; newPassword too long", async () => {
      mockResetPassword.resetPassword.mockResolvedValue({
        message: "Password successfully reset"
      })

      const requestData: ResetPasswordRequest = {
        userName: "lolcat",
        newPassword: "A".repeat(129) + "a1@",
        resetToken: "reset_token_123"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ message: "New password must be between 8 and 128 characters." })
    })

    it("Failure; newPassword too simple", async () => {
      mockResetPassword.resetPassword.mockResolvedValue({
        message: "Password successfully reset"
      })

      const requestData: ResetPasswordRequest = {
        userName: "lolcat",
        newPassword: "Password123",
        resetToken: "reset_token_123"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockResetPassword.resetPassword.mockRejectedValue(expressError)

      const requestData: ResetPasswordRequest = {
        userName: "lolcat",
        newPassword: "X7!k#9Lm@pQ2z$",
        resetToken: "reset_token_123"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockResetPassword.resetPassword.mockRejectedValue(generalError)

      const requestData: ResetPasswordRequest = {
        userName: "lolcat",
        newPassword: "X7!k#9Lm@pQ2z$",
        resetToken: "reset_token_123"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })
  })
})
