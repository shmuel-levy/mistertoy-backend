import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'

import { loggerService } from './services/logger.service.js'
import { toyRoutes } from './api/toy/toy.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'

const app = express()

// App Configuration
app.use(cookieParser()) // for res.cookies
app.use(express.json()) // for req.body
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
    // Express serves static files on production environment
    app.use(express.static('public'))
} else {
    // Configuring CORS for development
    const corsOptions = {
        origin: [
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
        ],
        credentials: true,
    }
    app.use(cors(corsOptions))
}

// Routes
app.use('/api/toy', toyRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)

// Fallback route
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

// Start the server
const port = process.env.PORT || 3030
app.listen(port, () => {
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
})