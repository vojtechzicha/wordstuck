import React, { Component, Fragment } from 'react'
import { Router, Route, withRouter } from 'react-router-dom'

import TeachScreen from './components/teach/TeachScreen'
import HeaderScreen from './components/HeaderScreen'
import EditorScreen from './components/EditorScreen'

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

class App extends Component {
  state = {
    combo: null,
    item: null
  }

  componentDidMount = () => {
    this.refreshCombo()
  }

  refreshCombo = async () => {
    const res = await this.fetch('items').then(res => res.json())
    this.setState({ combo: res, item: null })
    window.location.hash = ''
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
    const { item, combo } = this.state

    return (
      <Router history={history}>
        <ScrollToTop>
          <Route
            exact
            path="/"
            render={props =>
              auth.isAuthenticated() ? (
                <Fragment>
                  <HeaderScreen
                    fetch={this.fetch}
                    onSelectItem={this.handleSelectItem}
                    itemId={item}
                    combo={combo}
                    onLogout={() => auth.logout()}
                  />
                  {item !== null && <TeachScreen fetch={this.fetch} auth={auth} item={item} />}
                  {item !== null && <EditorScreen fetch={this.fetch} auth={auth} item={item} invalidate={this.refreshCombo} />}
                </Fragment>
              ) : (
                <Login auth={auth} />
              )
            }
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
    )
  }
}

export default App
