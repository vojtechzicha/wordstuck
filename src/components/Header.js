import React from 'react'
import { Link } from 'react-router-dom'

export const HeaderSearch = () => (
  <form className="form-inline my-2 my-lg-0">
    <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
    <button className="btn btn-outline-success my-2 my-sm-0" type="submit">
      Search
    </button>
  </form>
)

const Header = ({ children, match = { path: '' } }) => (
  <nav className="navbar navbar-expand-lg navbar-light bg-light">
    <Link to="/" className="navbar-brand">
      Assets
    </Link>
    <button
      className="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation">
      <span className="navbar-toggler-icon" />
    </button>

    <div className="collapse navbar-collapse justify-content-between" id="navbarSupportedContent">
      <ul className="navbar-nav">
        <li className={`nav-item ${match.path === '/' ? 'active' : ''}`}>
          <Link to="/" className="nav-link">
            Items
          </Link>
        </li>
        <li className={`nav-item ${match.path.startsWith('/budget') ? 'active' : ''}`}>
          <Link to="/budget" className="nav-link">
            Budget
          </Link>
        </li>
        <li className={`nav-item ${match.path.startsWith('/budget') ? 'active' : ''}`}>
          <Link to="/teach" className="nav-link">
            Teach
          </Link>
        </li>
      </ul>

      {children}
    </div>
  </nav>
)

export default Header
