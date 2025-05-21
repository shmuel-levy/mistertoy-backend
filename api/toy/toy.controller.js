import { loggerService } from '../../services/logger.service.js'
import { toyService } from './toy.service.js'

export async function getToys(req, res) {
    try {
        // Log the raw parameters
        console.log("Raw query params:", req.query);
        
        // Parse the filterBy JSON string
        let filterBy = {};
        if (req.query.filterBy) {
            try {
                filterBy = JSON.parse(req.query.filterBy);
            } catch (err) {
                console.error("Error parsing filterBy:", err);
            }
        }
        
        // Add pageIdx (sent separately)
        filterBy.pageIdx = +req.query.pageIdx || 0;
        
        // Parse sortBy if it exists
        if (req.query.sortBy) {
            try {
                filterBy.sortBy = JSON.parse(req.query.sortBy);
            } catch (err) {
                console.error("Error parsing sortBy:", err);
            }
        }
        
        console.log("Processed filterBy:", filterBy);
        
        const toys = await toyService.query(filterBy);
        res.send(toys);
    } catch (err) {
        loggerService.error('Cannot load toys', err);
        res.status(500).send({ err: 'Cannot load toys' });
    }
}

export async function getToyById(req, res) {
    try {
        const toyId = req.params.toyId
        const toy = await toyService.getById(toyId)
        res.send(toy)
    } catch (err) {
        loggerService.error('Cannot get toy', err)
        res.status(500).send({ err: 'Cannot get toy' })
    }
}

export async function addToy(req, res) {
    try {
        const toy = req.body
        const addedToy = await toyService.add(toy)
        res.send(addedToy)
    } catch (err) {
        loggerService.error('Cannot add toy', err)
        res.status(500).send({ err: 'Cannot add toy' })
    }
}

export async function updateToy(req, res) {
    try {
        const toy = req.body
        const updatedToy = await toyService.update(toy)
        res.send(updatedToy)
    } catch (err) {
        loggerService.error('Cannot update toy', err)
        res.status(500).send({ err: 'Cannot update toy' })
    }
}

export async function removeToy(req, res) {
    try {
        const toyId = req.params.toyId
        await toyService.remove(toyId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        loggerService.error('Cannot delete toy', err)
        res.status(500).send({ err: 'Cannot delete toy' })
    }
}

export async function addToyMsg(req, res) {
    try {
        const toyId = req.params.toyId
        const msg = req.body
        
        // Add user info to message
        if (req.loggedinUser) {
            msg.by = {
                _id: req.loggedinUser._id,
                fullname: req.loggedinUser.fullname
            }
        }
        
        const savedMsg = await toyService.addMsg(toyId, msg)
        res.send(savedMsg)
    } catch (err) {
        loggerService.error('Cannot add toy msg', err)
        res.status(500).send({ err: 'Cannot add toy msg' })
    }
}

export async function removeToyMsg(req, res) {
    try {
        const toyId = req.params.toyId
        const msgId = req.params.msgId
        const removedMsgId = await toyService.removeMsg(toyId, msgId)
        res.send(removedMsgId)
    } catch (err) {
        loggerService.error('Cannot delete toy msg', err)
        res.status(500).send({ err: 'Cannot delete toy msg' })
    }
}

export async function getLabels(req, res) {
    try {
        const labels = await toyService.getLabels()
        res.send(labels)
    } catch (err) {
        loggerService.error('Cannot get labels', err)
        res.status(500).send({ err: 'Cannot get labels' })
    }
}

export async function getLabelsCount(req, res) {
    try {
        const labelsCount = await toyService.getLabelsCount()
        res.send(labelsCount)
    } catch (err) {
        loggerService.error('Cannot get labels count', err)
        res.status(500).send({ err: 'Cannot get labels count' })
    }
}