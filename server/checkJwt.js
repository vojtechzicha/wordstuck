import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'

const issuer = process.env.AUTH_ISSUER
const audience = process.env.AUTH_AUDIENCE

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${issuer}.well-known/jwks.json`
  }),

  audience,
  issuer,
  algorithms: ['RS256']
})

export default checkJwt
