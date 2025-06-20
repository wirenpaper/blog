import express from "express"
import supertest from "supertest"
import { makeCreateCommentRouter } from "@business/comment/create-comment/createCommentController.js"
import { CreateComment } from "@db/comment/commentRepository.js"
import { makeCreateCommentService } from "@business/comment/create-comment/createCommentService.js"
import { mockCommentRepo } from "@db/comment/__mocks__/commentRepository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/comment/create-comment/createCommentService.js", () => ({
  makeCreateCommentService: jest.fn()
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
      mockCreateComment.createComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/32")
        .send({ mComment: "a comment" })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: "Comment created"
      })
    })

    it("Failure, postId is 0", async () => {
      mockCreateComment.createComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/0")
        .send({ mComment: "a comment" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "postId must be a positive integer."
      })
    })

    it("Failure, mComment is empty", async () => {
      mockCreateComment.createComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/1")
        .send({ mComment: "" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Comment cannot be empty., Comment must be between 1 and 500 characters."
      })
    })

    it("Failure, mComment is too big", async () => {
      mockCreateComment.createComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/1")
        .send({ mComment: "hello i am commenting here and i am going to make big comment lolololol wot are u gonna do mang lololol big comment what you gonna block my comment or something jajajajajajajajjajajaja theres too much going on here brain overriding stimulus override dopamine going jajajajajajaj swowowowoowowowowowoowierjiowerklfj sldkfjsdlfkjsdlkfjfsdkljweriojfweeiowefjiowefjfiowejfweiojfweiojwefiojwefiowefjiowefjiowefjwefiojfweiojwefiowefjiowefjiowefjiowefjiowefjfweiojwefiojfweiowefjiowefjiowefjiowefjiowefjwefiojwefiojwefio" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Comment must be between 1 and 500 characters."
      })
    })

    it("Failure, postId is not a number", async () => {
      mockCreateComment.createComment.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/ha")
        .send({ mComment: "hello i am commenting here and i am going to make big comment lolololol wot are u gonna do mang lololol big comment what you gonna block my comment or something jajajajajajajajjajajaja theres too much going on here brain overriding stimulus override dopamine going jajajajajajaj swowowowoowowowowowoowierjiowerklfj sldkfjsdlfkjsdlkfjfsdkljweriojfweeiowefjiowefjfiowejfweiojfweiojwefiojwefiowefjiowefjiowefjwefiojfweiojwefiowefjiowefjiowefjiowefjiowefjfweiojwefiojfweiowefjiowefjiowefjiowefjiowefjwefiojwefiojwefio" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "postId must be a numeric value., postId must be a positive integer., Comment must be between 1 and 500 characters."
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockCreateComment.createComment.mockRejectedValue(expressError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/32")
        .send({ mComment: "a comment" })

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })


    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockCreateComment.createComment.mockRejectedValue(generalError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/32")
        .send({ mComment: "a comment" })

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
