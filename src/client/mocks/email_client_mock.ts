import { EmailClient } from "@src/client/email_client.js"

export const mockEmailClient: jest.Mocked<EmailClient> = {
  sendPasswordResetEmail: jest.fn()
}
