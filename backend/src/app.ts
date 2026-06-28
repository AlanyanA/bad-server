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

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: string | boolean) => void) => {
        // Allow requests without origin (mobile apps, curl, desktop apps)
        if (!origin) {
            return callback(null, true)
        }
        
        // Allow local development origins
        if (origin === FRONTEND_URL || 
            origin === 'http://localhost' ||
            origin === 'http://localhost:80' ||
            origin === 'http://localhost:3000' ||
            origin === 'http://localhost:5173' ||
            origin === 'http://127.0.0.1' ||
            origin?.includes('localhost')) {
            return callback(null, true)
        }
        
        callback(null, FRONTEND_URL)
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-Token'],
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

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        }).on('error', (error) => {
            console.error('Server error:', error)
            process.exit(1)
        })
    } catch (error) {
        console.error('Bootstrap error:', error)
        process.exit(1)
    }
}

bootstrap()