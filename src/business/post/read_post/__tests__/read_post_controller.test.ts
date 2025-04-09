import express from "express"
import supertest from "supertest"
import { makeReadPostService, MakeReadPostService } from "@business/post/read_post/read_post_service.js"
import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { makeReadPostRouter } from "../read_post_controller.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/post/read_post/read_post_service.js", () => ({
  makeReadPostService: jest.fn()
}))

describe("makePostRouter", () => {
  describe("GET/:id", () => {
    let app: express.Express
    const mockReadPost: jest.Mocked<MakeReadPostService> = {
      readPost: jest.fn()
    }

    beforeAll(() => {
      (makeReadPostService as jest.Mock).mockReturnValue(mockReadPost)
      const router = makeReadPostRouter(mockPostRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; should edit if successful", async () => {
      mockReadPost.readPost.mockResolvedValue({
        id: 3,
        mPost: "hahapost",
        userId: 4,
        userName: "lolcop"
      })

      const response = await (supertest(app)
        .get("/3") as supertest.Test)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        id: 3,
        mPost: "hahapost",
        userId: 4,
        userName: "lolcop"
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockReadPost.readPost.mockRejectedValue(expressError)

      const response = await (supertest(app)
        .get("/3") as supertest.Test)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockReadPost.readPost.mockRejectedValue(generalError)

      const response = await (supertest(app)
        .get("/3") as supertest.Test)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
