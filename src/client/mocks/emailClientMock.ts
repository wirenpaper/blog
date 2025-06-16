import { EmailClient } from "@src/client/emailClient.js"

export const mockEmailClient: jest.Mocked<EmailClient> = {
  sendPasswordResetEmail: jest.fn()
}
