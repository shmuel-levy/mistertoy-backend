import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import {
    addToy,
    addToyMsg,
    getLabels,
    getLabelsCount,
    getToyById,
    getToys,
    removeToy,
    removeToyMsg,
    updateToy,
} from './toy.controller.js'

export const toyRoutes = express.Router()

toyRoutes.get('/', getToys)
toyRoutes.get('/labels', getLabels)
toyRoutes.get('/labels/count', getLabelsCount)
toyRoutes.get('/:toyId', getToyById)

toyRoutes.post('/', requireAuth, requireAdmin, addToy)
toyRoutes.put('/', requireAuth, requireAdmin, updateToy)
toyRoutes.delete('/:toyId', requireAuth, requireAdmin, removeToy)

toyRoutes.post('/:toyId/msg', requireAuth, addToyMsg)
toyRoutes.delete('/:toyId/msg/:msgId', requireAuth, removeToyMsg)