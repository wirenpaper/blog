import express from "express"
import supertest from "supertest"
import { makeForgotPasswordRouter, ForgotPasswordRequest } from
  "@business/auth/forgot_password/forgot_password_controller.js"
import { makeForgotPasswordService } from "@business/auth/forgot_password/forgot_password_service.js"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/auth/forgot_password/forgot_password_service.js", () => ({
  makeForgotPasswordService: jest.fn()
}))


describe("makeForgotPasswordRouter", () => {
  describe("POST /", () => {
    let app: express.Express
    const mockForgotPassword = {
      forgotPassword: jest.fn()
    }

    beforeAll(() => {
      (makeForgotPasswordService as jest.Mock).mockReturnValue(mockForgotPassword)
      const router = makeForgotPasswordRouter(mockUserRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      mockForgotPassword.forgotPassword.mockResolvedValue({
        message: "Reset instructions sent",
        resetToken: "mocked_reset_token"
      })

      const requestData: ForgotPasswordRequest = {
        userName: "testUser"
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: "Reset instructions sent",
        resetToken: "mocked_reset_token"
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockForgotPassword.forgotPassword.mockRejectedValue(expressError)

      const requestData: ForgotPasswordRequest = {
        userName: "testUser"
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
      mockForgotPassword.forgotPassword.mockRejectedValue(generalError)

      const requestData: ForgotPasswordRequest = {
        userName: "testUser"
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
