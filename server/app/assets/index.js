import { Router } from 'express'
import { ObjectID } from 'mongodb'
import { createReadStream } from 'streamifier'
import oneDriveApi from 'onedrive-api'
import uuid from 'uuid/v4'
import { extname } from 'path'
import moment from 'moment'

import checkJwt from '../../checkJwt'
import { calculateItemAbsolute, calculateItemRelative, calculateBudget } from './calculate'

const app = Router()

const prepareItem = item => ({
  ...item,
  ...(item.model !== undefined && item.model !== null ? { model: ObjectID(item.model.valueOf()) } : {})
})

app.get('/items', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    res.json(
      await db
        .collection('assets_item')
        .find({})
        .toArray()
    )
  } catch (e) {
    next(e)
  }
})

app.get('/item/:id', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    const item = await db.collection('assets_item').findOne({ _id: ObjectID(req.params.id) })
    const model = await db.collection('assets_model').findOne({ _id: item.model })

    const currentMonth = moment().format('YYYYMM')

    res.json({
      ...item,
      calculation: {
        ...(req.query.absolute !== undefined ? { absolute: calculateItemAbsolute(item, model, currentMonth) } : {}),
        ...(req.query.relative !== undefined
          ? { relative: calculateItemRelative(item, model, req.query.relative.length === undefined ? currentMonth : req.query.relative) }
          : {})
      }
    })
  } catch (e) {
    next(e)
  }
})

app.get('/item', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    res.json(await db.collection('assets_item').findOne())
  } catch (e) {
    next(e)
  }
})

app.post('/item/:id', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    const mongoRes = await db.collection('assets_item').updateOne({ _id: ObjectID(req.params.id) }, { $set: prepareItem(req.body) })

    if (mongoRes.result.ok === 1 && mongoRes.result.n === 1) {
      res.json({ status: 'ok' })
    } else if (mongoRes.result.ok === 1) {
      res.status(404).json({ status: 'err', errorCode: 404, errorMessage: 'ID Item not found' })
    } else {
      res.status(400).json({ status: 'err' })
    }
  } catch (e) {
    next(e)
  }
})

app.put('/item', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    const mongoRes = await db.collection('assets_item').insertOne(prepareItem(req.body))

    if (mongoRes.result.ok === 1 && mongoRes.result.n === 1) {
      res.json({ status: 'ok', id: mongoRes.insertedId })
    } else {
      res.status(400).json({ status: 'err' })
    }
  } catch (e) {
    next(e)
  }
})

app.delete('/item/:id', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    await db.collection('assets_item').deleteOne({ _id: ObjectID(req.params.id) })

    res.sendStatus(204)
  } catch (e) {
    next(e)
  }
})

app.put('/item/:id/document', checkJwt, async (req, res, next) => {
  const id = uuid()
  const db = req.app.locals.db

  try {
    const apiRes = await oneDriveApi.items.uploadSimple({
      accessToken: req.headers['x-onedrive-token'],
      filename: `${id}${extname(req.files.file.name)}`,
      readableStream: createReadStream(req.files.file.data),
      parentPath: `/DMS/Assets/${req.params.id}`
    })

    await db.collection('assets_item').updateOne(
      { _id: ObjectID(req.params.id) },
      {
        $push: {
          documents: {
            id,
            key: 'New Document',
            filename: req.files.file.name,
            oneDriveId: apiRes.id,
            oneDriveUrl: apiRes['@microsoft.graph.downloadUrl']
          }
        }
      }
    )

    res.sendStatus(201)
  } catch (e) {
    res.sendStatus(500)
  }
})

app.get('/item/:id/document/:docId', checkJwt, async (req, res, next) => {
  const db = req.app.locals.db

  try {
    const item = await db.collection('assets_item').findOne({ _id: ObjectID(req.params.id) }, { documents: 1, _id: 0 })
    const doc = item.documents.find(doc => doc.id === req.params.docId)

    const apiRes = await oneDriveApi.items.getMetadata({
      accessToken: req.headers['x-onedrive-token'],
      itemId: doc.oneDriveId
    })

    res.json({ link: apiRes['@microsoft.graph.downloadUrl'] })
  } catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
})

app.get('/item-models', checkJwt, async (req, res, next) => {
  const db = req.app.locals.db

  try {
    const models = await db
      .collection('assets_model')
      .find({})
      .project({ label: 1, _id: 1 })
      .sort({ label: 1 })
      .toArray()

    res.json(models)
  } catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
})

app.get('/items/budget', checkJwt, async (req, res, next) => {
  const db = req.app.locals.db

  try {
    const month = req.query.month

    const models = await db
      .collection('assets_model')
      .find({})
      .toArray()
    const items = await db
      .collection('assets_item')
      .find({})
      .toArray()

    res.json(calculateBudget(items, models, month))
  } catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
})

export default app
