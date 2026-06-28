import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const requestedPath = path.normalize(req.path)
        const filePath = path.join(baseDir, requestedPath)
        const normalizedPath = path.normalize(filePath)

        if (!normalizedPath.startsWith(path.normalize(baseDir + path.sep))) {
            return next()
        }

        fs.access(normalizedPath, fs.constants.F_OK, (accessErr) => {
            if (accessErr) {
                return next()
            }
            return res.sendFile(normalizedPath, (sendErr) => {
                if (sendErr) {
                    next(sendErr)
                }
            })
        })
    }
}
