import express from "express"
import supertest from "supertest"
import { makeCreateCommentRouter, CreateCommentRequest } from "@business/comment/create_comment/create_comment_controller.js"
import { CreateComment } from "@db/comment/comment_repository.js"
import { makeCreateCommentService } from "@business/comment/create_comment/create_comment_service.js"
import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
import { userIdExists } from "@business/comment/create_comment/create_comment_controller_aux.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/comment/create_comment/create_comment_service.js", () => ({
  makeCreateCommentService: jest.fn()
}))

jest.mock("@business/comment/create_comment/create_comment_controller_aux.js", () => ({
  userIdExists: jest.fn()
}))

describe("makeCreateCommentRouter", () => {
  describe("POST /", () => {
    let app: express.Express
    const mockCreateComment: jest.Mocked<CreateComment> = {
      createComment: jest.fn()
    }

    beforeAll(() => {
      (makeCreateCommentService as jest.Mock).mockReturnValue(mockCreateComment)
      const router = makeCreateCommentRouter(mockCommentRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; should return a token when login is successful", async () => {
      (userIdExists as jest.Mock).mockReturnValue(3)
      mockCreateComment.createComment.mockResolvedValue()

      const requestData: CreateCommentRequest = {
        mComment: "a comment",
        postId: 32
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: "Comment created"
      })
    })

    it("fail; userId doesnt exist", async () => {
      const expressError = createExpressError(500, "req.userId does not exist");
      (userIdExists as jest.Mock).mockImplementation(() => {
        throw expressError // Executes this code and throws synchronously
      })

      const requestData: CreateCommentRequest = {
        mComment: "a comment",
        postId: 32
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ message: "req.userId does not exist" })
    })

    it("Should handle ExpressError with correct status code", async () => {
      (userIdExists as jest.Mock).mockReturnValue(3)
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockCreateComment.createComment.mockRejectedValue(expressError)

      const requestData: CreateCommentRequest = {
        mComment: "a comment",
        postId: 32
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      (userIdExists as jest.Mock).mockReturnValue(3)
      const generalError = new Error("Database connection failed")
      mockCreateComment.createComment.mockRejectedValue(generalError)

      const requestData: CreateCommentRequest = {
        mComment: "a comment",
        postId: 32
      }

      const response = await (supertest(app)
        .post("/") as supertest.Test)
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
