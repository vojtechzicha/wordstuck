import { Router } from 'express'
import { ObjectID } from 'mongodb'

import checkJwt from '../checkJwt'

const app = Router()

app.get('/', checkJwt, async (req, res, next) => {
  try {
    const user = req.user.sub
    const db = req.app.locals.db

    res.json(
      await db
        .collection('items')
        .find({ user })
        .project({ _id: 1, title: 1 })
        .toArray()
    )
  } catch (e) {
    next(e)
  }
})

app.get('/:itemId', checkJwt, async (req, res, next) => {
  try {
    const user = req.user.sub
    const id = req.params.itemId
    const db = req.app.locals.db

    res.json(await db.collection('items').findOne({ user, _id: ObjectID(id) }))
  } catch (e) {
    next(e)
  }
})

app.put('/:itemId', checkJwt, async (req, res, next) => {
  try {
    const user = req.user.sub
    const id = req.params.itemId
    const db = req.app.locals.db

    const mres = await db
      .collection('items')
      .updateOne({ user, _id: ObjectID(id) }, { $set: { title: req.body.title, data: req.body.data } })
    res.json({ ok: mres.result.nModified === 1 })
  } catch (e) {
    next(e)
  }
})

app.delete('/:itemId', checkJwt, async (req, res, next) => {
  try {
    const user = req.user.sub
    const id = req.params.itemId
    const db = req.app.locals.db

    await db.collection('items').deleteOne({ user, _id: ObjectID(id) })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

app.put('/', checkJwt, async (req, res, next) => {
  try {
    const user = req.user.sub
    const db = req.app.locals.db

    const mres = await db.collection('items').insertOne({
      user,
      data: '',
      title: 'A new list :)'
    })
    console.log(mres)
    res.json({ ok: mres.result.ok === 1, id: mres.insertedId })
  } catch (e) {
    next(e)
  }
})

export default app
