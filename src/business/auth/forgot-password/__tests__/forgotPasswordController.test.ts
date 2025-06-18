import express from "express"
import supertest from "supertest"
import { makeForgotPasswordRouter, ForgotPasswordRequest } from
  "@business/auth/forgot-password/forgotPasswordController.js"
import { MakeForgotPasswordService, makeForgotPasswordService }
  from "@business/auth/forgot-password/forgotPasswordService.js"
import { mockUserRepo } from "@db/user/__mocks__/userRepository.mock.js"
import { mockEmailClient } from "@client/mocks/emailClientMock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/auth/forgot-password/forgotPasswordService.js", () => ({
  makeForgotPasswordService: jest.fn()
}))

describe("makeForgotPasswordRouter", () => {
  describe("POST /", () => {
    let app: express.Express
    const mockForgotPassword: jest.Mocked<MakeForgotPasswordService> = {
      forgotPassword: jest.fn()
    }

    beforeAll(() => {
      (makeForgotPasswordService as jest.Mock).mockReturnValue(mockForgotPassword)
      const router = makeForgotPasswordRouter(mockUserRepo, mockEmailClient)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      mockForgotPassword.forgotPassword.mockResolvedValue({ message: "Reset instructions sent" })

      const requestData: ForgotPasswordRequest = { userName: "testUser" }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: "Reset instructions sent" })
    })

    it("Failure; spaces only", async () => {
      mockForgotPassword.forgotPassword.mockResolvedValue({ message: "Reset instructions sent" })

      const requestData: ForgotPasswordRequest = { userName: "    " }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "User name cannot be empty."
      })
    })

    it("Failure; userName empty", async () => {
      mockForgotPassword.forgotPassword.mockResolvedValue({ message: "Reset instructions sent" })

      const requestData: ForgotPasswordRequest = { userName: "" }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ message: "User name cannot be empty." })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockForgotPassword.forgotPassword.mockRejectedValue(expressError)

      const requestData: ForgotPasswordRequest = { userName: "testUser" }

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
      mockForgotPassword.forgotPassword.mockRejectedValue(generalError)

      const requestData: ForgotPasswordRequest = { userName: "testUser" }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
