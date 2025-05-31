import express from "express"
import supertest from "supertest"
import { makeEditPostRouter } from "@business/post/edit_post/edit_post_controller.js"
import { makeEditPostService, MakeEditPostService } from "@business/post/edit_post/edit_post_service.js"
import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@business/post/edit_post/edit_post_service.js", () => ({
  makeEditPostService: jest.fn()
}))

describe("makeEditPostRouter", () => {
  describe("PUT/:id", () => {
    let app: express.Express
    const mockEditPost: jest.Mocked<MakeEditPostService> = {
      editPost: jest.fn()
    }

    beforeAll(() => {
      (makeEditPostService as jest.Mock).mockReturnValue(mockEditPost)
      const router = makeEditPostRouter(mockPostRepo)
      app = express()
      app.use(express.json())
      app.use("/", router)
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; should edit if successful", async () => {
      mockEditPost.editPost.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mPost: "harhar" })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: "Post edited" })
    })

    it("Failure; empty string", async () => {
      mockEditPost.editPost.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mPost: "" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ message: "Post cannot be empty., Post must be between 1 and 2000 characters." })
    })

    it("Failure; spaces only", async () => {
      mockEditPost.editPost.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mPost: "   " })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Post cannot be empty., Post must be between 1 and 2000 characters."
      })
    })

    it("Failure; post greater than 2000 chars", async () => {
      mockEditPost.editPost.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mPost: "hello i am commenting here and i am going to make big comment lolololol wot are u gonna do mang lololol big comment what you gonna block my comment or something jajajajajajajajjajajaja theres too much going on here brain overriding stimulus override dopamine going jajajajajajaj swowowowoowowowowowoowierjiowerklfj sldkfjsdlfkjsdlkfjfsdkljweriojfweeiowefjiowefjfiowejfweiojfweiojwefiojwefiowefjiowefjiowefjwefiojfweiojwefiowefjiowefjiowefjiowefjiowefjfweiojwefiojfweiowefjiowefjiowefjiowefjiowefjwefiojwefiojwefiohello i am commenting here and i am going to make big comment lolololol wot are u gonna do mang lololol big comment what you gonna block my comment or something jajajajajajajajjajajaja theres too much going on here brain overriding stimulus override dopamine going jajajajajajaj swowowowoowowowowowoowierjiowerklfj sldkfjsdlfkjsdlkfjfsdkljweriojfweeiowefjiowefjfiowejfweiojfweiojwefiojwefiowefjiowefjiowefjwefiojfweiojwefiowefjiowefjiowefjiowefjiowefjfweiojwefiojfweiowefjiowefjiowefjiowefjiowefjwefiojwefiojwefiohello i am commenting here and i am going to make big comment lolololol wot are u gonna do mang lololol big comment what you gonna block my comment or something jajajajajajajajjajajaja theres too much going on here brain overriding stimulus override dopamine going jajajajajajaj swowowowoowowowowowoowierjiowerklfj sldkfjsdlfkjsdlkfjfsdkljweriojfweeiowefjiowefjfiowejfweiojfweiojwefiojwefiowefjiowefjiowefjwefiojfweiojwefiowefjiowefjiowefjiowefjiowefjfweiojwefiojfweiowefjiowefjiowefjiowefjiowefjwefiojwefiojwefiohello i am commenting here and i am going to make big comment lolololol wot are u gonna do mang lololol big comment what you gonna block my comment or something jajajajajajajajjajajaja theres too much going on here brain overriding stimulus override dopamine going jajajajajajaj swowowowoowowowowowoowierjiowerklfj sldkfjsdlfkjsdlkfjfsdkljweriojfweeiowefjiowefjfiowejfweiojfweiojwefiojwefiowefjiowefjiowefjwefiojfweiojwefiowefjiowefjiowefjiowefjiowefjfweiojwefiojfweiowefjiowefjiowefjiowefjiowefjwefiojwefiojwefio" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "Post must be between 1 and 2000 characters."
      })
    })

    it("Failure; id is not number", async () => {
      mockEditPost.editPost.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/haha")
        .send({ mPost: "haha" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a numeric value., ID must be a positive integer."
      })
    })

    it("Failure; id is float", async () => {
      mockEditPost.editPost.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/1.1")
        .send({ mPost: "haha" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a positive integer."
      })
    })

    it("Failure; id is negative", async () => {
      mockEditPost.editPost.mockResolvedValue()

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/-1")
        .send({ mPost: "haha" })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        message: "ID must be a positive integer."
      })
    })

    it("Should handle ExpressError with correct status code", async () => {
      const expressError = createExpressError(422, "Password does not meet requirements")
      mockEditPost.editPost.mockRejectedValue(expressError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mPost: "harhar" })

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ message: "Password does not meet requirements" })
    })

    it("Should handle general errors with 500 status code", async () => {
      // Simulate a general error
      const generalError = new Error("Database connection failed")
      mockEditPost.editPost.mockRejectedValue(generalError)

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const response = await supertest(app)
        .put("/3")
        .send({ mPost: "harhar" })

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: "Database connection failed" })
    })

  })
})
