import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import App from './components/App';
import reducers from './reducers';

const logger = createLogger();

/* https://github.com/zalmoxisus/redux-devtools-extension Mihail Diordiev (https://github.com/zalmoxisus) (MIT) */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
ReactDOM.render(
  <Provider store={createStore(reducers, composeEnhancers(applyMiddleware(thunk, logger)))}>
    <App />
  </Provider>, document.getElementById('root')
);
