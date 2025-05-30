import express from "express"
import supertest from "supertest"
import { makePostRouter, PostService } from "@business/post/create_post/create_post_controller.js"
import { MakePostService, makePostService } from "@business/post/create_post/create_post_service.js"
import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/post/create_post/create_post_service.js", () => ({
  makePostService: jest.fn()
}))


describe("makePostRouter", () => {
  describe("POST /", () => {
    let app: express.Express
    const mockCreatePost: jest.Mocked<MakePostService> = {
      createPost: jest.fn()
    }

    beforeAll(() => {
      (makePostService as jest.Mock).mockReturnValue(mockCreatePost)
      const router = makePostRouter(mockPostRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; should return a token when login is successful", async () => {
      mockCreatePost.createPost.mockResolvedValue({
        id: 32,
        mPost: "ha",
        userId: 1,
      })


      const requestData: PostService = {
        mPost: "harharpost"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        id: 32,
        mPost: "ha",
        userId: 1,
      })
    })

    it("Failure; empty string", async () => {
      mockCreatePost.createPost.mockResolvedValue({
        id: 32,
        mPost: "ha",
        userId: 1,
      })


      const requestData: PostService = {
        mPost: ""
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Post cannot be empty., Comment must be between 1 and 2000 characters."
      })
    })

    it("Failure; spaces only", async () => {
      mockCreatePost.createPost.mockResolvedValue({
        id: 32,
        mPost: "ha",
        userId: 1,
      })


      const requestData: PostService = {
        mPost: ""
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Post cannot be empty., Comment must be between 1 and 2000 characters."
      })
    })

    it("Failure; post greater than 2000 chars", async () => {
      mockCreatePost.createPost.mockResolvedValue({
        id: 32,
        mPost: "ha",
        userId: 1,
      })


      const requestData: PostService = {
        mPost: "hello i am commenting here and i am going to make big comment lolololol wot are u gonna do mang lololol big comment what you gonna block my comment or something jajajajajajajajjajajaja theres too much going on here brain overriding stimulus override dopamine going jajajajajajaj swowowowoowowowowowoowierjiowerklfj sldkfjsdlfkjsdlkfjfsdkljweriojfweeiowefjiowefjfiowejfweiojfweiojwefiojwefiowefjiowefjiowefjwefiojfweiojwefiowefjiowefjiowefjiowefjiowefjfweiojwefiojfweiowefjiowefjiowefjiowefjiowefjwefiojwefiojwefiohello i am commenting here and i am going to make big comment lolololol wot are u gonna do mang lololol big comment what you gonna block my comment or something jajajajajajajajjajajaja theres too much going on here brain overriding stimulus override dopamine going jajajajajajaj swowowowoowowowowowoowierjiowerklfj sldkfjsdlfkjsdlkfjfsdkljweriojfweeiowefjiowefjfiowejfweiojfweiojwefiojwefiowefjiowefjiowefjwefiojfweiojwefiowefjiowefjiowefjiowefjiowefjfweiojwefiojfweiowefjiowefjiowefjiowefjiowefjwefiojwefiojwefiohello i am commenting here and i am going to make big comment lolololol wot are u gonna do mang lololol big comment what you gonna block my comment or something jajajajajajajajjajajaja theres too much going on here brain overriding stimulus override dopamine going jajajajajajaj swowowowoowowowowowoowierjiowerklfj sldkfjsdlfkjsdlkfjfsdkljweriojfweeiowefjiowefjfiowejfweiojfweiojwefiojwefiowefjiowefjiowefjwefiojfweiojwefiowefjiowefjiowefjiowefjiowefjfweiojwefiojfweiowefjiowefjiowefjiowefjiowefjwefiojwefiojwefiohello i am commenting here and i am going to make big comment lolololol wot are u gonna do mang lololol big comment what you gonna block my comment or something jajajajajajajajjajajaja theres too much going on here brain overriding stimulus override dopamine going jajajajajajaj swowowowoowowowowowoowierjiowerklfj sldkfjsdlfkjsdlkfjfsdkljweriojfweeiowefjiowefjfiowejfweiojfweiojwefiojwefiowefjiowefjiowefjwefiojfweiojwefiowefjiowefjiowefjiowefjiowefjfweiojwefiojfweiowefjiowefjiowefjiowefjiowefjwefiojwefiojwefio"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Comment must be between 1 and 2000 characters."
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockCreatePost.createPost.mockRejectedValue(expressError)

      const requestData: PostService = {
        mPost: "harharpost"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockCreatePost.createPost.mockRejectedValue(generalError)

      const requestData: PostService = {
        mPost: "harharpost"
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .post("/")
        .send(requestData)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
