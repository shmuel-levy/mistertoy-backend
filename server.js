import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import http from 'http'

import { loggerService } from './services/logger.service.js'
import { setupSocketAPI } from './services/socket.service.js'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
import { toyRoutes } from './api/toy/toy.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'

const app = express()
const server = http.createServer(app)

// App Configuration
app.use(cookieParser()) // for res.cookies
app.use(express.json()) // for req.body
app.use(express.static('public'))

// Use ALS middleware
app.use(setupAsyncLocalStorage)

// Setup Socket.io
setupSocketAPI(server)

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
            'http://localhost:5175',
            'http://127.0.0.1:5175'
        ],
        credentials: true,
    }
    app.use(cors(corsOptions))
}

// Routes
app.use('/api/toy', toyRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/review', reviewRoutes)

// Fallback route
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const port = process.env.PORT || 3030
server.listen(port, () => {
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
})