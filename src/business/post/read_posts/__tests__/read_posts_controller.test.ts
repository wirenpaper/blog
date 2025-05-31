import express from "express"
import supertest from "supertest"
import { makeReadPostsRouter } from "@business/post/read_posts/read_posts_controller.js"
import { makeReadPostsService, MakeReadPostsService } from "@business/post/read_posts/read_posts_service.js"
import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/post/read_posts/read_posts_service.js", () => ({
  makeReadPostsService: jest.fn()
}))

describe("makeEditPostRouter", () => {
  describe("PUT/:id", () => {
    let app: express.Express
    const mockReadPosts: jest.Mocked<MakeReadPostsService> = {
      readPosts: jest.fn()
    }

    beforeAll(() => {
      (makeReadPostsService as jest.Mock).mockReturnValue(mockReadPosts)
      const router = makeReadPostsRouter(mockPostRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; single result", async () => {
      mockReadPosts.readPosts.mockResolvedValue([
        { id: 32, mPost: "harhar", userId: 2, userName: "lolcop" }
      ])

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/")

      expect(response.status).toBe(200)
      expect(response.body).toEqual([
        { id: 32, mPost: "harhar", userId: 2, userName: "lolcop" }
      ])
    })

    it("Success; multiple result", async () => {
      mockReadPosts.readPosts.mockResolvedValue([
        { id: 32, mPost: "harhar", userId: 2, userName: "lolcop" },
        { id: 33, mPost: "dahaha", userId: 3, userName: "bobcat" },
        { id: 34, mPost: "soisoi", userId: 4, userName: "bobrob" }
      ])

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/")

      expect(response.status).toBe(200)
      expect(response.body).toEqual([
        { id: 32, mPost: "harhar", userId: 2, userName: "lolcop" },
        { id: 33, mPost: "dahaha", userId: 3, userName: "bobcat" },
        { id: 34, mPost: "soisoi", userId: 4, userName: "bobrob" }
      ])
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockReadPosts.readPosts.mockRejectedValue(expressError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/")

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockReadPosts.readPosts.mockRejectedValue(generalError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/")

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
