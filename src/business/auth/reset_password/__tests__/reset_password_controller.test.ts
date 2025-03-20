import express from "express"
import supertest from "supertest"
import { makeResetPasswordRouter, ResetPasswordRequest } from
  "@business/auth/reset_password/reset_password_controller.js"
import { makeResetPasswordService } from "@business/auth/reset_password/reset_password_service.js"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { createExpressError } from "@src/errors.js"
import { ForgotPasswordRequest } from "@business/auth/forgot_password/forgot_password_controller.js"

jest.mock("@business/auth/reset_password/reset_password_service.js", () => ({
  makeResetPasswordService: jest.fn()
}))


describe("makeLoginRouter", () => {
  describe("POST /", () => {
    let app: express.Express
    const mockResetPassword = {
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

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: "Password successfully reset"
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

      const response = await (supertest(app)
        .post("/") as supertest.Test)
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

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })
  })
})
