import auth0 from 'auth0-js'
import history from './history'

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: process.env.REACT_APP_AUTH_DOMAIN,
    clientID: process.env.REACT_APP_AUTH_CLIENT_ID,
    redirectUri: `${document.location.origin}/${process.env.PUBLIC_URL}callback`,
    audience: process.env.REACT_APP_AUTH_AUDIENCE,
    responseType: 'token id_token',
    scope: 'openid'
  })

  token = null

  login = () => {
    localStorage.removeItem('onedrive_access_token')
    this.auth0.authorize()
  }

  handleAuthentication = () => {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult)
        history.replace('/')
      } else if (err) {
        history.replace('/')
        console.error(err)
      }
    })
  }

  setSession = authResult => {
    const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime())
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)

    this.token = authResult.idToken

    history.replace('/')
  }

  getToken = () => {
    if (this.token !== null) return this.token

    return localStorage.getItem('id_token') || null
  }

  logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')

    this.token = null

    history.replace('/')
  }

  isAuthenticated = () => new Date().getTime() < JSON.parse(localStorage.getItem('expires_at'))

  isOneDriveAuthenticated = () => new Date().getTime() < JSON.parse(localStorage.getItem('onedrive_expires_at'))

  handleOneDriveAuthentication = hash => {
    if (/access_token=([^&]+)/.exec(hash)[1] !== undefined) {
      const expiresIn = JSON.parse(decodeURIComponent(/expires_in=([^&]+)/.exec(hash)[1]))
      const expiresAt = JSON.stringify(expiresIn * 1000 + new Date().getTime())
      localStorage.setItem('onedrive_expires_at', expiresAt)
      localStorage.setItem('onedrive_access_token', decodeURIComponent(/access_token=([^&]+)/.exec(hash)[1]))
      history.replace('/')
    }
  }

  getOneDriveToken = () => localStorage.getItem('onedrive_access_token')
}
