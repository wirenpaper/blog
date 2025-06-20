import { makeEmailClient } from "@src/client/emailClient.js"
import { testEmailConfig } from "@src/client/__tests__/testEmail.config.js"

describe("makeEmailClient", () => {
  describe("sendPasswordResetEmail", () => {
    it("Success; check http://localhost:1080", async () => {
      const emailClient = makeEmailClient(testEmailConfig)
      await emailClient.sendPasswordResetEmail({
        recipient: "saif.rashiduddin@example.com",
        resetToken: "abc123-def456-ghi789"
      })
      console.log("🌐 Email sent! Check http://localhost:1080 to view it")
    })
  })
})
