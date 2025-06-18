import { createApp } from "@src/app.js"
import testSql from "@db/dbTestSetup.js"
import { testEmailConfig } from "@client/__tests__/testEmail.config.js"

const PORT = process.env.PORT ?? 5003

const app = createApp(testSql, testEmailConfig)
// This file's ONLY job is to start the server
app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`)
})
