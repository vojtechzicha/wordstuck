import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH_ISSUER}.well-known/jwks.json`
  }),

  audience: process.env.AUTH_AUDIENCE,
  issuer: process.env.AUTH_ISSUER,
  algorithms: ['RS256']
})

export default checkJwt
