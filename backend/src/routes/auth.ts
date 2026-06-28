import { Request, Response, Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import {
    validateAuthentication,
    validateUserBody,
    validateUserUpdateBody,
} from '../middlewares/validations'

const authRouter = Router()

const csrfHandler = (req: Request, res: Response) => {
    res.status(200).json({ csrfToken: req.csrfToken() })
}

authRouter.get('/csrf', csrfHandler)
authRouter.get('/csrf-token', csrfHandler)
authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, validateUserUpdateBody, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', validateAuthentication, login)
authRouter.post('/token', refreshAccessToken)
authRouter.post('/logout', logout)
authRouter.post('/register', validateUserBody, register)

export default authRouter
