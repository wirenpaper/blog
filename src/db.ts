import postgres from 'postgres'

const sql = postgres({
  host: 'localhost',
  port: 5432,
  database: 'blogdb',
  username: process.env.USERNAME,
  password: process.env.PASSWORD
})

export type PostgresClient = ReturnType<typeof postgres>

export default sql
