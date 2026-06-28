import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const app = express()

const { PORT = 3000, FRONTEND_URL = 'http://localhost:5173' } = process.env
const corsOrigin = FRONTEND_URL || 'http://localhost:5173'

const corsOptions = {
    origin: (
        _origin: string | undefined,
        callback: (err: Error | null, allow?: string | boolean) => void
    ) => callback(null, corsOrigin),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-CSRF-Token',
        'X-XSRF-Token',
    ],
    optionsSuccessStatus: 204,
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Слишком много запросов, попробуйте позже',
    },
})

app.use(helmet())
app.use(cookieParser())
app.use(cors(corsOptions))

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true, limit: '10kb' }))
app.use(json({ limit: '10kb' }))

app.use(limiter)

app.use(routes)
app.use(errors())
app.use(errorHandler)

const sleep = (delayMs: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, delayMs)
    })

const connectToDatabase = async (
    retries = 10,
    delayMs = 2000,
    attempt = 1
) => {
    try {
        await mongoose.connect(DB_ADDRESS)
        console.log('Database connected')
    } catch (error) {
        console.error(
            `Database connection attempt ${attempt}/${retries} failed`,
            error
        )

        if (attempt >= retries) {
            console.warn(
                'Database unavailable; continuing to start the server for non-database routes'
            )
            return
        }

        await sleep(delayMs)
        await connectToDatabase(retries, delayMs, attempt + 1)
    }
}

const bootstrap = async () => {
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })

    server.on('error', (error) => {
        console.error('Server error:', error)
        process.exit(1)
    })

    try {
        await connectToDatabase()
    } catch (error) {
        console.error('Bootstrap error:', error)
    }
}

bootstrap()