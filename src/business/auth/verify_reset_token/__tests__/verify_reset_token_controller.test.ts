import express from "express"
import supertest from "supertest"
import { makeVerifyResetTokenRouter, ResetRequest } from
  "@business/auth/verify_reset_token/verify_reset_token_controller.js"
import { MakeVerifyResetTokenService, makeVerifyResetTokenService } from "@business/auth/verify_reset_token/verify_reset_token_service.js"
import { mockUserRepo } from "@db/user/__mocks__/user_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/auth/verify_reset_token/verify_reset_token_service.js", () => ({
  makeVerifyResetTokenService: jest.fn()
}))

describe("makeVerifyResetTokenRouter", () => {
  describe("POST /", () => {
    let app: express.Express
    const mockVerifyResetToken: jest.Mocked<MakeVerifyResetTokenService> = {
      verifyResetToken: jest.fn()
    }

    beforeAll(() => {
      (makeVerifyResetTokenService as jest.Mock).mockReturnValue(mockVerifyResetToken)
      const router = makeVerifyResetTokenRouter(mockUserRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      mockVerifyResetToken.verifyResetToken.mockResolvedValue({
        message: "Token verified, proceed to password reset"
      })

      const requestData: ResetRequest = {
        resetToken: "reset_token_123"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: "Token verified, proceed to password reset" })
    })

    it("Failure; resetToken cannot be empty", async () => {
      mockVerifyResetToken.verifyResetToken.mockResolvedValue({
        message: "Token verified, proceed to password reset"
      })

      const requestData: ResetRequest = {
        resetToken: ""
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ message: "resetToken cannot be empty." })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockVerifyResetToken.verifyResetToken.mockRejectedValue(expressError)

      const requestData: ResetRequest = {
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
      mockVerifyResetToken.verifyResetToken.mockRejectedValue(generalError)

      const requestData: ResetRequest = {
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
