import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import logger from "redux-logger"
import thunk from "redux-thunk"
import promise from "redux-promise-middleware"

import reducers from './reducers'
import ReactRouter from './components/Router.js'


const middleware = applyMiddleware(promise(), thunk, logger())

ReactDOM.render(
  <Provider store={createStore(reducers, middleware)}>
    <ReactRouter />
  </Provider>
  , document.getElementById('root'))
