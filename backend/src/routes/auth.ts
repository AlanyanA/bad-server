import { Router } from 'express'
import {
    getCsrfToken,
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
    issueCsrfToken,
    verifyCsrfToken,
    verifyOrigin,
} from '../middlewares/csfr'

const registerAuthRoutes = (router: Router) => {
    router.get('/csrf-token', issueCsrfToken, getCsrfToken)

    router.get('/user', auth, getCurrentUser)
    router.get('/user/roles', auth, getCurrentUserRoles)

    router.post('/login', issueCsrfToken, login)
    router.post('/register', issueCsrfToken, register)

    router.patch('/me', auth, verifyOrigin, verifyCsrfToken, updateCurrentUser)
    router.post('/token', verifyOrigin, verifyCsrfToken, refreshAccessToken)
    router.post('/logout', verifyOrigin, verifyCsrfToken, logout)
}

const authRouter = Router()
registerAuthRoutes(authRouter)

export default authRouter