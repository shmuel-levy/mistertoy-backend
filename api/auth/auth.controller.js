import { loggerService } from '../../services/logger.service.js'
import { authService } from './auth.service.js'

export async function login(req, res) {
    const { username, password } = req.body
    console.log('Login attempt:', { username, password }) 
    
    try {
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)
        
        console.log('Login successful for:', username)
        res.cookie('loginToken', loginToken)
        
        res.json(user)
    } catch (err) {
        console.error('Login failed:', err.message)
        res.status(401).send({ err: 'Failed to Login' })
    }
}
export async function signup(req, res) {
    try {
        const { username, password, fullname } = req.body

        // IMPORTANT!!!
        // Never write passwords to log file!!!
        // loggerService.debug(fullname + ', ' + username + ', ' + password)

        const account = await authService.signup(username, password, fullname)
        loggerService.debug(
            `auth.route - new account created: ` + JSON.stringify(account)
        )

        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)

        res.cookie('loginToken', loginToken)
        res.json(user)
    } catch (err) {
        loggerService.error('Failed to signup ' + err)
        res.status(500).send({ err: 'Failed to signup' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}
