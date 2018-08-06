import React, { Component, Fragment } from 'react'

const TemplateNavigation = ({ onLogout, item }) => (
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
          {item !== null && (
            <li className="nav-item">
              <a className="nav-link js-scroll-trigger" href="#download">
                Learn
              </a>
            </li>
          )}
          {item !== null && (
            <li className="nav-item">
              <a className="nav-link js-scroll-trigger" href="#features">
                Editor
              </a>
            </li>
          )}
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

const TemplateHeader = ({ combo, onSelectItem, itemId, onLogout, onNewItem }) => (
  <Fragment>
    <TemplateNavigation onLogout={onLogout} item={itemId} />
    <header className="masthead">
      <div className="container h-100">
        <div className="row h-100">
          <div className="col-lg-7 my-auto">
            <div className="header-content mx-auto">
              <h1 className="mb-5">WordStuck will teach you the vocabulary you need!</h1>
              <h2 className="mb-5">Just select the class:</h2>
              {combo === null ? (
                <div className="progress" style={{ marginBottom: '10px' }}>
                  <div
                    className="progress-bar progress-bar-striped bg-warning"
                    role="progressbar"
                    style={{ width: '100%' }}
                    aria-valuenow="100"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              ) : (
                <select
                  className="mb-5 form-control"
                  value={itemId === null ? '!_nothing' : itemId._id}
                  onChange={e => {
                    onSelectItem(e.currentTarget.value[0] === '!' ? null : e.currentTarget.value)
                    if (e.currentTarget.value === '!_new') onNewItem()
                  }}>
                  <option value="!_nothing">What would you like to learn?</option>
                  {combo.map(op => (
                    <option key={op._id} value={op._id}>
                      {op.title}
                    </option>
                  ))}
                  <option value="!_new">Add new...</option>
                </select>
              )}
              {itemId !== null && (
                <Fragment>
                  <div className="row">
                    <div className="col-md-6">
                      <a href="#download" className="btn btn-outline btn-xl js-scroll-trigger">
                        Teach me!
                      </a>
                    </div>
                    <div className="col-md-6">
                      <a href="#features" className="btn btn-outline btn-xl js-scroll-trigger">
                        Change
                      </a>
                    </div>
                  </div>
                </Fragment>
              )}
            </div>
          </div>
          <div className="col-lg-5 my-auto">
            <div className="device-container">
              <div className="device-mockup iphone_se portrait white">
                <div className="device">
                  <div className="screen">
                    <img src="img/japanese-basic-numbers.jpg" className="img-fluid" alt="" />
                  </div>
                  <div className="button" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  </Fragment>
)

class HeaderScreen extends Component {
  state = {}

  render() {
    const { onSelectItem, itemId, combo, onNewItem } = this.props
    return <TemplateHeader combo={combo} onSelectItem={onSelectItem} onNewItem={onNewItem} itemId={itemId} />
  }
}

export default HeaderScreen
