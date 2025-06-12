import { createApp } from "@src/app.js" // Import the configured app
import testSql from "@db/db_test_setup"
import { testEmailConfig } from "@src/client/__tests__/test_email.config.js"

const PORT = process.env.PORT ?? 5003

const app = createApp(testSql, testEmailConfig)
// This file's ONLY job is to start the server
app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`)
})
