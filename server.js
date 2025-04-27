import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import path from 'path'

import { loggerService } from './services/logger.service.js'
import { toyService } from './services/toy.service.js'

const app = express()
//* App Configuration
app.use(cookieParser()) // for res.cookies
app.use(express.json()) // for req.body
// console.log('process.env.NODE_ENV:', process.env.NODE_ENV)
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
        ],
        credentials: true,
    }
    app.use(cors(corsOptions))
}

app.get('/api/toy', (req, res) => {
    try {
        // Parse the filterBy, sortBy, and pageIdx from query parameters
        const filterBy = req.query.filterBy ? JSON.parse(req.query.filterBy) : {};
        const sortBy = req.query.sortBy ? JSON.parse(req.query.sortBy) : {};
        const pageIdx = parseInt(req.query.pageIdx) || 0;
        
        toyService.query(filterBy, sortBy, pageIdx)
            .then(result => {
                res.send(result);
            })
            .catch(err => {
                loggerService.error('Cannot load toys', err);
                res.status(400).send('Cannot load toys');
            });
    } catch (err) {
        loggerService.error('Failed to parse query parameters', err);
        res.status(400).send('Invalid query parameters');
    }
});

app.get('/api/toy/labels', (req, res) => {
    return toyService.getLabels()
        .then(labels => {
            res.send(labels)
        })
        .catch(err => {
            loggerService.error('Cannot get labels', err)
            res.status(400).send(err)
        })
})

app.get('/api/toy/labels/count', (req, res) => {
    return toyService.getLabelsCount()
        .then(labelsCount => res.send(labelsCount))
        .catch(err => {
            loggerService.error('Cannot get labels count', err)
            res.status(400).send(err)
        })
})

app.get('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.get(toyId)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error('Cannot get toy', err)
            res.status(400).send(err)
        })
})


app.post('/api/toy', (req, res) => {
    const { name, price, labels } = req.body
    const toy = {
        name,
        price: +price,
        labels,
    }
    toyService.save(toy)
        .then(savedToy => res.send(savedToy))
        .catch(err => {
            loggerService.error('Cannot add toy', err)
            res.status(400).send('Cannot add toy')
        })
})

app.put('/api/toy', (req, res) => {
    const { name, price, _id, labels, inStock } = req.body
    const toy = {
        _id,
        name,
        price: +price,
        labels,
        inStock
    }
    toyService.save(toy)
        .then(savedToy => res.send(savedToy))
        .catch(err => {
            loggerService.error('Cannot update toy', err)
            res.status(400).send('Cannot update toy')
        })
})

app.delete('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.remove(toyId)
        .then(() => {
            res.send()
        })
        .catch(err => {
            loggerService.error('Cannot delete toy', err)
            res.status(400).send('Cannot delete toy, ' + err)
        })
})


//* In production with Render
// app.get('/api/apikey', (req, res) => {
//    res.send(process.env.API_KEY)
// })



// Fallback
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

//* Listen will always be the last line in our server!
const port = process.env.PORT || 3030
app.listen(port, () => {
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
})
