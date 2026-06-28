import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { mkdirSync } from 'fs'
import { join } from 'path'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        const safeUploadTemp = process.env.UPLOAD_PATH_TEMP
            ? process.env.UPLOAD_PATH_TEMP.replace(/[^a-zA-Z0-9_-]/g, '')
            : ''
        const destinationPath = join(
            __dirname,
            safeUploadTemp
                ? `../public/${safeUploadTemp}`
                : '../public'
        )

        mkdirSync(destinationPath, { recursive: true })

        cb(null, destinationPath)
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const timestamp = Date.now()
        const extension = file.originalname.split('.').pop()?.toLowerCase() || 'bin'
        const safeBaseName = file.originalname
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 40) || 'file'
        cb(null, `${safeBaseName}_${timestamp}.${extension}`)
    },
})

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/webp',
]

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!types.includes(file.mimetype)) {
        return cb(null, false)
    }

    return cb(null, true)
}

export default multer({
    storage,
    fileFilter,
    limits: {
        // allow slightly above 10MB so controller enforces the 10MB max
        fileSize: 11 * 1024 * 1024,
    },
})
