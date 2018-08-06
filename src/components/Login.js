import { Component } from 'react'

export default class Login extends Component {
  componentDidMount() {
    this.props.auth.login()
  }

  render() {
    return null
  }
}
