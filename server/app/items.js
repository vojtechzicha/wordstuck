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

export default app
