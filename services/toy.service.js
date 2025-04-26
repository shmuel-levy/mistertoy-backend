import fs from 'fs'
import { utilService } from './util.service.js'


const PAGE_SIZE = 6
const toys = utilService.readJsonFile('data/toy.json')
const labels = [
    'On wheels',
    'Box game',
    'Art',
    'Baby',
    'Doll',
    'Puzzle',
    'Outdoor',
    'Battery Powered',
]

export const toyService = {
    query,
    get,
    remove,
    save,
    getLabels,
    getLabelsCount
}

function query(filterBy = {}, sortBy = {}, pageIdx = 0) {
    let filteredToys = toys
    
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }
    
    if (filterBy.inStock !== undefined && filterBy.inStock !== null) {
        filteredToys = filteredToys.filter(toy => toy.inStock === filterBy.inStock)
    }
    
    if (filterBy.labels && filterBy.labels.length > 0) {
        filteredToys = filteredToys.filter(toy => {
            return filterBy.labels.every(label => toy.labels.includes(label))
        })
    }
    
    if (sortBy.type) {
        filteredToys.sort((t1, t2) => {
            const sortDirection = sortBy.desc ? -1 : 1
            if (sortBy.type === 'name') {
                return t1.name.localeCompare(t2.name) * sortDirection
            } else if (sortBy.type === 'price') {
                return (t1.price - t2.price) * sortDirection
            } else if (sortBy.type === 'created') {
                return (t1.createdAt - t2.createdAt) * sortDirection
            }
        })
    }
    
    const totalPages = Math.ceil(filteredToys.length / PAGE_SIZE)
    
    if (pageIdx !== undefined) {
        let startIdx = pageIdx * PAGE_SIZE
        filteredToys = filteredToys.slice(startIdx, startIdx + PAGE_SIZE)
    }
    
    return Promise.resolve({ toys: filteredToys, totalPages })
}

function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Toy not found')
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No such toy')
    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        toys[idx] = { ...toys[idx], ...toy }
    } else {
        toy._id = _makeId()
        toy.createdAt = Date.now()
        toy.inStock = true
        toys.unshift(toy)
    }
    return _saveToysToFile().then(() => toy)
}

function getLabels() {
    return Promise.resolve(labels)
}

function getLabelsCount() {
    const labelCounts = {}
    toys.forEach(toy => {
        toy.labels.forEach(label => {
            if (!labelCounts[label]) labelCounts[label] = { total: 0, inStock: 0 }
            labelCounts[label].total++
            if (toy.inStock) labelCounts[label].inStock++
        })
    })
    return Promise.resolve(labelCounts)
}

function _makeId(length = 5) {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const toysStr = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', toysStr, err => {
            if (err) {
                return console.log(err)
            }
            resolve()
        })
    })
}
