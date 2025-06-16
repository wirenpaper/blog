import { makeEmailClient } from "@src/client/emailClient.js"
import { testEmailConfig } from "@src/client/__tests__/testEmail.config.js"

describe("makeEmailClient", () => {
  describe("sendPasswordResetEmail", () => {
    it("Fail; maildev is off", async () => {
      const emailClient = makeEmailClient(testEmailConfig)
      await expect(emailClient.sendPasswordResetEmail({
        recipient: "saif.rashiduddin@example.com",
        resetToken: "abc123-def456-ghi789"
      })).rejects.toMatchObject({
        address: "127.0.0.1",
        code: "ESOCKET",
        command: "CONN",
        errno: -111,
        port: 1025,
        syscall: "connect"
      })
    })
  })
})
