import express from "express"
import supertest from "supertest"
import { makeGetPostCommentsRouter } from "@business/comment/get-post-comments/getPostCommentsController.js"
import { makeGetPostCommentsService } from "@business/comment/get-post-comments/getPostCommentsService.js"
import { GetPostCommentsSpecifications } from "@db/comment/commentRepository.js"
import { mockCommentRepo } from "@db/comment/__mocks__/commentRepository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/comment/get-post-comments/getPostCommentsService.js", () => ({
  makeGetPostCommentsService: jest.fn()
}))

describe("makeGetPostCommentsRouter", () => {
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
        { commentId: 3, mComment: "a comment", userId: 1, userName: "Johny" }
      ])

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/3")

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        "comments": [
          { commentId: 3, mComment: "a comment", userId: 1, userName: "Johny" }
        ]
      })
    })

    it("Success; multiple results", async () => {
      mockGetComments.getPostComments.mockResolvedValue([
        { commentId: 3, mComment: "a comment", userId: 1, userName: "Johny" },
        { commentId: 4, mComment: "another comment", userId: 2, userName: "Jany" }
      ])

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/3")

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        "comments": [
          { commentId: 3, mComment: "a comment", userId: 1, userName: "Johny" },
          { commentId: 4, mComment: "another comment", userId: 2, userName: "Jany" }
        ]
      })
    })

    it("Success; no result", async () => {
      mockGetComments.getPostComments.mockResolvedValue([])

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/3")

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        "comments": []
      })
    })

    it("Failure; negative id", async () => {
      mockGetComments.getPostComments.mockResolvedValue([
        { commentId: 3, mComment: "a comment", userId: 1, userName: "Johny" }
      ])

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/-1")

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "postId must be a positive integer."
      })
    })

    it("Failure; float id", async () => {
      mockGetComments.getPostComments.mockResolvedValue([
        { commentId: 3, mComment: "a comment", userId: 1, userName: "Johny" }
      ])

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/1.1")

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "postId must be a positive integer."
      })
    })

    it("Failure; float id", async () => {
      mockGetComments.getPostComments.mockResolvedValue([
        { commentId: 3, mComment: "a comment", userId: 1, userName: "Johny" }
      ])

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/jaja")

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "postId must be a numeric value., postId must be a positive integer."
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockGetComments.getPostComments.mockRejectedValue(expressError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/3")

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockGetComments.getPostComments.mockRejectedValue(generalError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .get("/3")

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
