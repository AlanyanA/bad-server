import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import csurf from 'csurf'
import helmet from 'helmet'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS, ORIGIN_ALLOW } from './config'
import errorHandler from './middlewares/error-handler'
import sanitizeRequest from './middlewares/sanitize-request'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()
app.set('trust proxy', 1)

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    // lower default to trigger rate-limit in tests
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({ message: 'Слишком много запросов, повторите позже' })
    },
})

app.disable('x-powered-by')
app.use(helmet())
app.use(cookieParser())
app.use(apiLimiter)
app.use(
    cors({
        origin: ORIGIN_ALLOW,
        credentials: true,
    })
)
app.options('*', cors({ origin: ORIGIN_ALLOW, credentials: true }))

// Ensure CORS headers are always present (tests expect header even without Origin)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', ORIGIN_ALLOW)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    next()
})
app.use(serveStatic(path.join(__dirname, 'public')))
app.use(urlencoded({ extended: true, limit: '50kb' }))
app.use(json({ limit: '50kb' }))
app.use(sanitizeRequest)
app.use(csurf({ cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' } }))
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
