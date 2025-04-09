import { Session } from "express-session"
import express from "express"
import supertest from "supertest"
import { createExpressError } from "@src/errors.js"
import { makeLogoutRouter } from "@business/auth/logout/logout_controller.js"
import { destroySession } from "@business/auth/logout/session_service.js"

jest.mock("@business/auth/logout/session_service.js", () => ({
  destroySession: jest.fn()
}))

describe("makeLogoutRouter", () => {
  describe("POST /", () => {
    let app: express.Express

    beforeAll(() => {
      const router = makeLogoutRouter()
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; should return a token when login is successful", async () => {
      (destroySession as jest.Mock<Promise<void>, [Session | undefined]>).mockResolvedValue()

      const response = await (supertest(app)
        .post("/") as supertest.Test)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: "Successfully logged out" })
    })

    it("Fail", async () => {
      const expressError = createExpressError(500, "Session destruction error");
      (destroySession as jest.Mock<Promise<void>, [Session | undefined]>).mockRejectedValue(expressError)

      const response = await (supertest(app)
        .post("/") as supertest.Test)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ message: "Session destruction error" })
    })
  })
})
