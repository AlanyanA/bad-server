import { NextFunction, Request, Response } from 'express'
import { sanitizeObject, hasForbiddenKeys } from '../utils/sanitizeObject'
import BadRequestError from '../errors/bad-request-error'

const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
    // If request contains Mongo-style operators or dotted keys, reject explicitly
    if (hasForbiddenKeys(req.body || {}) || hasForbiddenKeys(req.query || {}) || hasForbiddenKeys(req.params || {})) {
        return next(new BadRequestError('Невалидные параметры запроса'))
    }

    req.body = sanitizeObject(req.body || {})
    req.query = sanitizeObject(req.query || {})
    req.params = sanitizeObject(req.params || {})
    return next()
}

export default sanitizeRequest
