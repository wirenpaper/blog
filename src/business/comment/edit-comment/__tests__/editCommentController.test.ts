import express from "express"
import supertest from "supertest"
import { makeEditCommentRouter } from "@business/comment/edit-comment/editCommentController.js"
import { makeEditCommentService, MakeEditCommentService } from
  "@business/comment/edit-comment/editCommentService.js"
import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/comment/edit-comment/editCommentService.js", () => ({
  makeEditCommentService: jest.fn()
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
      mockEditComment.editComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mComment: "Some test comment" })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: "Comment updated"
      })
    })

    it("Failure, empty comment", async () => {
      mockEditComment.editComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mComment: "" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Comment cannot be empty., Comment must be between 1 and 500 characters."
      })
    })

    it("Failure, pure space comment", async () => {
      mockEditComment.editComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mComment: "  " })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Comment cannot be empty., Comment must be between 1 and 500 characters."
      })
    })

    it("Failure, comment more than 500", async () => {
      mockEditComment.editComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mComment: "This is a test comment that needs to be exactly five hundred and one characters long to trigger the validation error for exceeding the maximum length limit. I need to keep writing until I reach that specific character count. Let me add some more words to get closer to the target. Almost there now, just a few more characters needed to reach exactly five hundred and one characters total for this validation test comment that should fail the length check. i need more mang what is this? i need more or" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Comment must be between 1 and 500 characters."
      })
    })

    it("Failure, id is 0", async () => {
      mockEditComment.editComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/0")
        .send({ mComment: "Test comment" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a positive integer."
      })
    })

    it("Failure, id is -1", async () => {
      mockEditComment.editComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/-1")
        .send({ mComment: "Test comment" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a positive integer."
      })
    })

    it("Failure, id isn't number", async () => {
      mockEditComment.editComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/m")
        .send({ mComment: "Test comment" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a numeric value., ID must be a positive integer."
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockEditComment.editComment.mockRejectedValue(expressError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mComment: "Some test comment" })

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockEditComment.editComment.mockRejectedValue(generalError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mComment: "Some test comment" })

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
