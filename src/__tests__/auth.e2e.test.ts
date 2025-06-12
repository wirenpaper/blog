import { Express } from "express"
import supertest from "supertest"
import { createApp } from "@src/app.js"
import testSql, { createTables, dropTables } from "@db/db_test_setup.js" // Your test database connection
import { testEmailConfig } from "@src/client/__tests__/test_email.config.js"
import { RegisterRequest } from "@business/auth/register/register_controller"

// const app = createApp(testSql, testEmailConfig)
describe("E2E: POST /auth/register", () => {
  let app: Express
  beforeEach(async () => {
    app = createApp(testSql, testEmailConfig)
    await testSql.unsafe(dropTables)
    await testSql.unsafe(createTables)
  })

  afterAll(async () => {
    await testSql.unsafe(dropTables)
    await testSql.end()
  })

  it("primary success", async () => {
    const registerUser: RegisterRequest = {
      userName: "testUser@gmail.com",
      password: "K!m1@2025#P@ssw0rd$",
      firstName: "John",
      lastName: "Doe"
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await supertest(app)
      .post("/auth/register") // Your endpoint from app.ts
      .send(registerUser)

    const res = await testSql.unsafe("select * from users")
    expect(res).toMatchObject([{
      id: 1,
      user_name: "testUser@gmail.com",
      first_name: "John",
      last_name: "Doe",
      reset_token: null,
      reset_token_expires: null,
      token_verified: false
    }])

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await supertest(app)
      .post("/")

  })

})
