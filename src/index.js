import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import $ from 'jquery'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()

$(() => {
  $('[data-toggle="popover"]').popover({
    html: true,
    content: function() {
      let content = $(this).attr('data-popover-content')
      return $(content)
        .children('.popover-body')
        .html()
    },
    title: function() {
      let title = $(this).attr('data-popover-content')
      return $(title)
        .children('.popover-heading')
        .html()
    }
  })
})
