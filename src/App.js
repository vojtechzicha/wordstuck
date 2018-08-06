import React, { Component, Fragment } from 'react'
import { Router, Route, withRouter } from 'react-router-dom'

import TeachScreen from './components/teach/TeachScreen'
import HeaderScreen from './components/HeaderScreen'

import Login from './components/Login'
import Auth from './Auth'
import history from './history'

const auth = new Auth()

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication()
  }
}

const Callback = () => null

const ScrollToTop = withRouter(
  class extends Component {
    componentDidUpdate(prevProps) {
      if (this.props.location !== prevProps.location) {
        window.scrollTo(0, 0)
      }
    }

    render() {
      return this.props.children
    }
  }
)

const TemplateNavigation = ({ onLogout }) => (
  <nav className="navbar navbar-expand-lg navbar-light fixed-top" id="mainNav">
    <div className="container">
      <a className="navbar-brand js-scroll-trigger" href="#page-top">
        Word Stuck
      </a>
      <button
        className="navbar-toggler navbar-toggler-right"
        type="button"
        data-toggle="collapse"
        data-target="#navbarResponsive"
        aria-controls="navbarResponsive"
        aria-expanded="false"
        aria-label="Toggle navigation">
        Menu
        <i className="fa fa-bars" />
      </button>
      <div className="collapse navbar-collapse" id="navbarResponsive">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <a className="nav-link js-scroll-trigger" href="#page-top">
              Select Class
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link js-scroll-trigger" href="#download">
              Learn
            </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              href="#page-top"
              onClick={e => {
                onLogout(e)
                e.preventDefault()
              }}>
              Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
)

class App extends Component {
  state = {
    item: null
  }

  fetch = (action, options = {}, headers = {}) => {
    return fetch(`${process.env.REACT_APP_SERVER_URI}api/v1/${action}`, {
      ...options,
      headers: new Headers({
        ...headers,
        Authorization: `Bearer ${auth.getToken()}`
      })
    })
  }

  handleSelectItem = async itemId => {
    if (itemId === null) {
      this.setState({ item: null })
      return
    }

    this.setState({
      item: await this.fetch(`items/${itemId}`).then(res => res.json())
    })
  }

  render() {
    const { item } = this.state

    return auth.isAuthenticated() ? (
      <Router history={history}>
        <ScrollToTop>
          <Route
            exact
            path="/"
            render={props => (
              <Fragment>
                <TemplateNavigation onLogout={() => auth.logout()} />
                <HeaderScreen fetch={this.fetch} onSelectItem={this.handleSelectItem} itemId={item} />
                {item !== null && <TeachScreen fetch={this.fetch} auth={auth} item={item} />}
              </Fragment>
            )}
          />
          <Route
            exact
            path="/callback"
            render={props => {
              handleAuthentication(props)
              return <Callback {...props} />
            }}
          />
        </ScrollToTop>
      </Router>
    ) : (
      <Login auth={auth} />
    )
  }
}

export default App
