import { Express } from "express"
import axios from "axios"
import supertest from "supertest"
import { createApp } from "@src/app.js"
import testSql, { createTables, dropTables } from "@db/dbTestSetup.js" // Your test database connection
import { testEmailConfig } from "@src/client/__tests__/testEmail.config.js"
import { MailDevEmail } from "@src/client/emailClient.js"
import bcrypt from "bcrypt"

// The correct API endpoint for MailDev v1
const MAILDEV_CHECK_URL = "http://localhost:1080/email"
const MAILDEV_DELETE_URL = "http://localhost:1080/email/all"

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

  // This is the specific test that needs MailDev
  it("primary success: should complete the forgot password flow", async () => {
    // 1. Check if MailDev is running. If not, fail with a clear message.
    try {
      // Use a short timeout so we don't wait long if it's not running.
      await axios.get(MAILDEV_CHECK_URL, { timeout: 1500 })
    } catch (_error) {
      // If the GET request fails for any reason, throw our specific error.
      throw new Error("RUN 'npx maildev'")
    }

    // Let this be the only check. If MailDev isn't running or the path is wrong, this will fail.
    // We are now using the correct URL for MailDev v1.
    await axios.delete(MAILDEV_DELETE_URL)

    // Now, proceed with the actual test logic.
    const registerUser = {
      userName: "testUser@gmail.com",
      password: "K!m1@2025#P@ssw0rd$",
      firstName: "John",
      lastName: "Doe",
    }

    // 1. Register and request password reset
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await supertest(app)
      .post("/auth/register")
      .send(registerUser)

    let res = await testSql.unsafe("select * from users")
    expect(res).toMatchObject([{
      id: 1,
      user_name: "testUser@gmail.com",
      first_name: "John",
      last_name: "Doe",
      reset_token: null,
      reset_token_expires: null,
    }])
    // THE NEW CHECK: Explicitly check the hashed_password property
    expect(res[0].hashed_password).not.toBeNull()
    expect(res[0].hashed_password).toEqual(expect.any(String)) // A more specific check

    // 2. Forgot password
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await supertest(app)
      .post("/auth/forgot-password")
      .send({ userName: registerUser.userName })
    res = await testSql.unsafe("select * from users")
    expect(res).toMatchObject([{
      id: 1,
      user_name: "testUser@gmail.com",
      first_name: "John",
      last_name: "Doe",
    }])
    expect(res[0].hashed_password).not.toBeNull()
    expect(res[0].hashed_password).toEqual(expect.any(String)) // A more specific check
    expect(res[0].reset_token).not.toBeNull()
    expect(res[0].reset_token).toEqual(expect.any(String)) // A more specific check
    expect(res[0].reset_token_expires).not.toBeNull()
    expect((res[0].reset_token_expires as Date).getTime()).toBeGreaterThan(new Date().getTime())

    const { data: emails } = await axios.get<MailDevEmail[]>(MAILDEV_CHECK_URL)
    const email = emails[0]

    const urlMatch = /href="(http:\/\/localhost:3000\/reset-password\?token=[^"]*)"/.exec(email.html)
    expect(urlMatch).not.toBeNull()
    const fullUrl = urlMatch![1]

    const url = new URL(fullUrl)
    const plainTextToken = url.searchParams.get("token")

    // 3. reset password
    const newPassword = "Tr0ub4dor&3"
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await supertest(app)
      .post("/auth/reset-password")
      .send({
        userName: res[0].user_name as string,
        resetToken: plainTextToken,
        newPassword
      })
    const query =
      await testSql`
          select hashed_password as "hashedPassword"
          from users
          where
          user_name = ${res[0].user_name as string}
      `
    const tokenValid = await bcrypt.compare(newPassword, query[0].hashedPassword as string)
    expect(tokenValid).toBe(true)
  })
})
