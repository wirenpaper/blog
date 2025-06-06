import { makeEmailClient } from "@src/client/email_client.js"
import { testEmailConfig } from "@src/client/__tests__/test_email.config.js"

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
