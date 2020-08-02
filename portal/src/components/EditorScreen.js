import React, { Component } from 'react'

class EditorScreen extends Component {
  state = {
    title: '',
    data: '',
    show: false
  }

  componentDidMount = () => {
    if (this.props.item !== null) {
      this.setState({
        title: this.props.item.title,
        data: this.props.item.data,
        show: this.props.item.title === 'A new list :)'
      })
    }
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.item === null) {
      this.setState({
        title: '',
        data: '',
        show: false
      })
    } else if (nextProps.item._id !== this.props.item._id) {
      this.setState({
        title: nextProps.item.title,
        data: nextProps.item.data,
        show: nextProps.item.title === 'A new list :)'
      })
    }
  }

  handleSave = async (title, data) => {
    await this.props.fetch(
      `items/${this.props.item._id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          title,
          data
        })
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    )
    this.props.invalidate()
  }

  handleRemove = async () => {
    await this.props.fetch(
      `items/${this.props.item._id}`,
      {
        method: 'DELETE'
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    )
    this.props.invalidate()
  }

  render() {
    const { title, data, show } = this.state

    return (
      <section className='features' id='features'>
        <div className='container'>
          <div className='section-heading text-center'>
            <h2>
              Let's edit{' '}
              <code contentEditable={true} className='gatherTitle'>
                {title}
              </code>
            </h2>
            <p className='text-muted'>You'll learn so many words! Smart!</p>
            <hr />
            {!show ? (
              <button className='btn btn-outline btn-lg btn-primary' onClick={() => this.setState({ show: true })}>
                Start editing
              </button>
            ) : (
              <div className='row'>
                <div className='col-md-6'>
                  <button
                    className='btn btn-outline btn-lg btn-primary'
                    onClick={() => this.handleSave(document.getElementsByClassName('gatherTitle')[0].innerText, data)}>
                    Save
                  </button>
                </div>
                <div className='col-md-6'>
                  <button className='btn btn-danger' onClick={() => this.handleRemove()}>
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
          {show ? (
            <div className='row'>
              <textarea
                style={{ width: '100%', height: '100%', fontFamily: 'Dank Mono,Consolas' }}
                rows={20}
                value={data}
                onChange={e => this.setState({ data: e.currentTarget.value })}
              />
            </div>
          ) : (
            <div className='row'>
              <textarea
                style={{ width: '100%', height: '100%', fontFamily: 'Dank Mono,Consolas' }}
                rows={20}
                defaultValue=''
                disabled={true}
              />
            </div>
          )}
        </div>
      </section>
    )
  }
}

export default EditorScreen
