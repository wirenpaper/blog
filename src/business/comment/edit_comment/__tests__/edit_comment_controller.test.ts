import express from "express"
import supertest from "supertest"
import { makeEditCommentRouter } from "@business/comment/edit_comment/edit_comment_controller.js"
import { makeEditCommentService, MakeEditCommentService } from
  "@business/comment/edit_comment/edit_comment_service.js"
import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
import { userIdExists } from "@business/comment/edit_comment/edit_comment_controller_aux.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/comment/edit_comment/edit_comment_service.js", () => ({
  makeEditCommentService: jest.fn()
}))

jest.mock("@business/comment/edit_comment/edit_comment_controller_aux.js", () => ({
  userIdExists: jest.fn()
}))

describe("makeEditCommentRouter", () => {
  describe("PUT /:id", () => {
    let app: express.Express
    const mockEditComment: jest.Mocked<MakeEditCommentService> = {
      editComment: jest.fn()
    }

    beforeAll(() => {
      (makeEditCommentService as jest.Mock).mockReturnValue(mockEditComment)
      const router = makeEditCommentRouter(mockCommentRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      (userIdExists as jest.Mock<number>).mockReturnValue(3)
      mockEditComment.editComment.mockResolvedValue()

      const response = await (supertest(app)
        .put("/3") as supertest.Test)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: "Comment updated"
      })
    })

    it("fail; userId doesnt exist", async () => {
      const expressError = createExpressError(500, "req.userId does not exist");
      (userIdExists as jest.Mock<number>).mockImplementation(() => {
        throw expressError // Executes this code and throws synchronously
      })

      const response = await (supertest(app)
        .put("/3") as supertest.Test)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ message: "req.userId does not exist" })
    })

    it("Should handle ExpressError with correct status code", async () => {
      (userIdExists as jest.Mock<number>).mockReturnValue(3)
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockEditComment.editComment.mockRejectedValue(expressError)

      const response = await (supertest(app)
        .put("/3") as supertest.Test)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      (userIdExists as jest.Mock<number>).mockReturnValue(3)
      const generalError = new Error("Database connection failed")
      mockEditComment.editComment.mockRejectedValue(generalError)

      const response = await (supertest(app)
        .put("/3") as supertest.Test)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
