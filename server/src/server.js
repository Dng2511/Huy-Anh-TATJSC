import dotenv from 'dotenv'
import { createApp } from './app.js'
import { connectDatabase } from './config/db.js'
import { ensureAdminExists } from './initAdmin.js'

dotenv.config()

const port = Number(process.env.PORT || 5000)

async function bootstrap() {
  try {
    await connectDatabase()
    await ensureAdminExists()

    const app = createApp()
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

bootstrap()
