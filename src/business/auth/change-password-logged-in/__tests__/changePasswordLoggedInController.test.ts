import express from "express"
import supertest from "supertest"
import { makeChangePasswordLoggedInRouter, ChangePasswordRequest } from
  "@business/auth/change-password-logged-in/changePasswordLoggedInController.js"
import { MakeChangePasswordLoggedInService, makeChangePasswordLoggedInService } from
  "@business/auth/change-password-logged-in/changePasswordLoggedInService.js"
import { mockUserRepo } from "@db/user/__mocks__/userRepository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/auth/change-password-logged-in/changePasswordLoggedInService.js", () => ({
  makeChangePasswordLoggedInService: jest.fn()
}))

describe("makeChangePasswordLoggedInRouter", () => {
  describe("POST /", () => {
    let app: express.Express
    const mockChangePasswordLoggedIn: jest.Mocked<MakeChangePasswordLoggedInService> = {
      changePasswordLoggedIn: jest.fn()
    }

    // Create variable to control whether userId is defined
    let mockUserIdEnabled = true

    beforeAll(() => {
      (makeChangePasswordLoggedInService as jest.Mock).mockReturnValue(mockChangePasswordLoggedIn)
      const router = makeChangePasswordLoggedInRouter(mockUserRepo)
      app = express()
      app.use(express.json())

      // Add middleware to mock req.userId before the router
      app.use((req, _res, next) => {
        if (mockUserIdEnabled)
          req.userId = 30
        next()
      })

      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
      // Reset flag before each Test
      mockUserIdEnabled = true
    })

    it("Success", async () => {
      mockChangePasswordLoggedIn.changePasswordLoggedIn.mockResolvedValue({
        message: "Password successfully changed"
      })

      const requestData: ChangePasswordRequest = {
        currentPassword: "K!m1@2025#P@ssw0rd$",
        newPassword: "X7!k#9Lm@pQ2z$"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        result: {
          message: "Password successfully changed"
        }
      })
    })

    it("Failure; currentPassword empty", async () => {
      mockChangePasswordLoggedIn.changePasswordLoggedIn.mockResolvedValue({
        message: "Password successfully changed"
      })

      const requestData: ChangePasswordRequest = {
        currentPassword: "",
        newPassword: "X7!k#9Lm@pQ2z$"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Current password is required."
      })
    })

    it("Failure; currentPassword only spaces", async () => {
      mockChangePasswordLoggedIn.changePasswordLoggedIn.mockResolvedValue({
        message: "Password successfully changed"
      })

      const requestData: ChangePasswordRequest = {
        currentPassword: "   ",
        newPassword: "X7!k#9Lm@pQ2z$"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Current password is required."
      })
    })

    it("Failure; newPassword too short", async () => {
      mockChangePasswordLoggedIn.changePasswordLoggedIn.mockResolvedValue({
        message: "Password successfully changed"
      })

      const requestData: ChangePasswordRequest = {
        currentPassword: "abcd",
        newPassword: "1234567"
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
      mockChangePasswordLoggedIn.changePasswordLoggedIn.mockResolvedValue({
        message: "Password successfully changed"
      })

      const requestData: ChangePasswordRequest = {
        currentPassword: "abcd",
        newPassword: "A".repeat(129) + "a1@"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "New password must be between 8 and 128 characters."
      })
    })

    it("Failure; newPassword too simple", async () => {
      mockChangePasswordLoggedIn.changePasswordLoggedIn.mockResolvedValue({
        message: "Password successfully changed"
      })

      const requestData: ChangePasswordRequest = {
        currentPassword: "abcd",
        newPassword: "Password123"
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

    it("!req.userId", async () => {
      mockUserIdEnabled = false

      const requestData: ChangePasswordRequest = {
        currentPassword: "K!m1@2025#P@ssw0rd$",
        newPassword: "X7!k#9Lm@pQ2z$"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        message: "userId doesnt exist"
      })
    })

    it("Some specific error", async () => {
      const expressError = createExpressError(422, "Some specific error")
      mockChangePasswordLoggedIn.changePasswordLoggedIn.mockRejectedValue(expressError)

      const requestData: ChangePasswordRequest = {
        currentPassword: "K!m1@2025#P@ssw0rd$",
        newPassword: "X7!k#9Lm@pQ2z$"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Some specific error" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Some general error")
      mockChangePasswordLoggedIn.changePasswordLoggedIn.mockRejectedValue(generalError)

      const requestData: ChangePasswordRequest = {
        currentPassword: "K!m1@2025#P@ssw0rd$",
        newPassword: "X7!k#9Lm@pQ2z$"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Some general error" })
    })

  })

})
