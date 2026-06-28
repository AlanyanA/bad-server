import { NextFunction, Request, Response } from 'express'
import { sanitizeObject } from '../utils/sanitizeObject'

const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
    req.body = sanitizeObject(req.body || {})
    req.query = sanitizeObject(req.query || {})
    req.params = sanitizeObject(req.params || {})
    next()
}

export default sanitizeRequest
