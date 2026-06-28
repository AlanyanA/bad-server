import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import fs from 'fs'
import path from 'path'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    const originalName = req.file.originalname || ''
    if (originalName.includes('/') || originalName.includes('\\')) {
        return next(new BadRequestError('Невалидное имя файла'))
    }

    try {
        // Enforce minimum and maximum sizes
        const size = req.file.size
        if (size < 2 * 1024) {
            return next(new BadRequestError('Файл слишком маленький'))
        }
        if (size > 10 * 1024 * 1024) {
            return next(new BadRequestError('Файл слишком большой'))
        }

        // Validate mime by file signature for common image types (PNG)
        try {
            const filePath = (req.file as any).path || path.join(process.cwd(), req.file.filename)
            const fd = fs.openSync(filePath, 'r')
            const header = Buffer.alloc(8)
            fs.readSync(fd, header, 0, 8, 0)
            fs.closeSync(fd)
            // PNG signature: 89 50 4E 47 0D 0A 1A 0A
            const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
            if (req.file.mimetype === 'image/png' && !header.equals(pngSignature)) {
                return next(new BadRequestError('Невалидный тип файла'))
            }
        } catch (e) {
            // ignore signature check failures
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
