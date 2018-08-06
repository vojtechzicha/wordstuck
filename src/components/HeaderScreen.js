import React, { Component } from 'react'

const TemplateHeader = ({ combo }) => (
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
              <select className="mb-5 form-control">
                {combo.map(op => <option key={op._id}>{op.title}</option>)}
                <option>Add new...</option>
              </select>
            )}
            <a href="#download" className="btn btn-outline btn-xl js-scroll-trigger">
              Teach me!
            </a>
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
)

class HeaderScreen extends Component {
  state = {
    combo: null
  }

  componentDidMount = async () => {
    const res = await this.props.fetch('items').then(res => res.json())
    this.setState({ combo: res })
  }

  render() {
    const { combo } = this.state
    return <TemplateHeader combo={combo} />
  }
}

export default HeaderScreen
