import express from "express"
import supertest from "supertest"
import { makeGetPostCommentsRouter } from "@business/comment/get_post_comments/get_post_comments_controller.js"
import { makeGetPostCommentsService } from "@business/comment/get_post_comments/get_post_comments_service.js"
import { GetPostCommentsSpecifications } from "@db/comment/comment_repository.js"
import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/comment/get_post_comments/get_post_comments_service.js", () => ({
  makeGetPostCommentsService: jest.fn()
}))

describe("makeEditCommentRouter", () => {
  describe("GET /:id", () => {
    let app: express.Express
    const mockGetComments: jest.Mocked<GetPostCommentsSpecifications> = {
      getPostComments: jest.fn()
    }

    beforeAll(() => {
      (makeGetPostCommentsService as jest.Mock).mockReturnValue(mockGetComments)
      const router = makeGetPostCommentsRouter(mockCommentRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; single result", async () => {
      mockGetComments.getPostComments.mockResolvedValue([
        { id: 3, mComment: "a comment" }
      ])

      const response = await (supertest(app)
        .get("/3") as supertest.Test)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        "comments": [
          { id: 3, mComment: "a comment" }
        ]
      })
    })

    it("Success; multiple results", async () => {
      mockGetComments.getPostComments.mockResolvedValue([
        { id: 3, mComment: "a comment" },
        { id: 4, mComment: "another comment" }
      ])

      const response = await (supertest(app)
        .get("/3") as supertest.Test)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        "comments": [
          { id: 3, mComment: "a comment" },
          { id: 4, mComment: "another comment" }
        ]
      })
    })

    it("Success; no result", async () => {
      mockGetComments.getPostComments.mockResolvedValue([])

      const response = await (supertest(app)
        .get("/3") as supertest.Test)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        "comments": []
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockGetComments.getPostComments.mockRejectedValue(expressError)

      const response = await (supertest(app)
        .get("/3") as supertest.Test)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockGetComments.getPostComments.mockRejectedValue(generalError)

      const response = await (supertest(app)
        .get("/3") as supertest.Test)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
