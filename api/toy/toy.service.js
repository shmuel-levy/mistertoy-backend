import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

const PAGE_SIZE = 6

export const toyService = {
    query,
    getById,
    remove,
    add,
    update,
    addMsg,
    removeMsg,
    getLabels,
    getLabelsCount
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('toy')
        let sortCriteria = {}
        
        if (filterBy.sortBy && filterBy.sortBy.type) {
            const sortDirection = filterBy.sortBy.desc ? -1 : 1
            sortCriteria[filterBy.sortBy.type] = sortDirection
        } else {
            sortCriteria = { createdAt: -1 }
        }
        
        const totalCount = await collection.countDocuments(criteria)
        const startIdx = filterBy.pageIdx !== undefined ? filterBy.pageIdx * PAGE_SIZE : 0
        
        const toys = await collection
            .find(criteria)
            .sort(sortCriteria)
            .skip(startIdx)
            .limit(PAGE_SIZE)
            .toArray()
            
        const totalPages = Math.ceil(totalCount / PAGE_SIZE)
        
        return { toys, totalPages }
    } catch (err) {
        loggerService.error('Cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        
        if (!toy.msgs) toy.msgs = []
        
        return toy
    } catch (err) {
        loggerService.error(`While finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
    } catch (err) {
        loggerService.error(`Cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        toy.createdAt = Date.now()
        toy.inStock = true
        
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        loggerService.error('Cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToSave = { ...toy }
        delete toyToSave._id
        
        const collection = await dbService.getCollection('toy')
        await collection.updateOne(
            { _id: ObjectId.createFromHexString(toy._id) },
            { $set: toyToSave }
        )
        return toy
    } catch (err) {
        loggerService.error(`Cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function addMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne(
            { _id: ObjectId.createFromHexString(toyId) },
            { $push: { msgs: msg } }
        )
        return msg
    } catch (err) {
        loggerService.error(`Cannot add message to toy ${toyId}`, err)
        throw err
    }
}

async function removeMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne(
            { _id: ObjectId.createFromHexString(toyId) },
            { $pull: { msgs: { id: msgId } } }
        )
        return msgId
    } catch (err) {
        loggerService.error(`Cannot remove message from toy ${toyId}`, err)
        throw err
    }
}

async function getLabels() {
    return [
        'On wheels',
        'Box game',
        'Art',
        'Baby',
        'Doll',
        'Puzzle',
        'Outdoor',
        'Battery Powered'
    ]
}

async function getLabelsCount() {
    try {
        const collection = await dbService.getCollection('toy')
        const toys = await collection.find({}).toArray()
        
        const labelCounts = {}
        toys.forEach(toy => {
            toy.labels.forEach(label => {
                if (!labelCounts[label]) labelCounts[label] = { total: 0, inStock: 0 }
                labelCounts[label].total++
                if (toy.inStock) labelCounts[label].inStock++
            })
        })
        
        return labelCounts
    } catch (err) {
        loggerService.error('Cannot get labels count', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    
    if (filterBy.txt) {
        criteria.name = { $regex: filterBy.txt, $options: 'i' }
    }
    
    if (filterBy.inStock !== undefined && filterBy.inStock !== null) {
        criteria.inStock = filterBy.inStock === true || filterBy.inStock === 'true'
    }
    
    if (filterBy.labels && filterBy.labels.length > 0) {
        criteria.labels = { $all: filterBy.labels }
    }
    
    return criteria
}