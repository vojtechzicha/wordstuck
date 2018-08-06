import { Router } from 'express'
import { ObjectID } from 'mongodb'

import checkJwt from '../../checkJwt'

const app = Router()

app.get('/items', checkJwt, async (req, res, next) => {
  try {
    const db = req.app.locals.db

    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

export default app
