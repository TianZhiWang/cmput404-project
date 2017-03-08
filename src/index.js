import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import App from './components/App';
import reducers from './reducers';

ReactDOM.render(
  <Provider store={createStore(reducers,
    /* https://github.com/zalmoxisus/redux-devtools-extension Mihail Diordiev (https://github.com/zalmoxisus) (MIT) */
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )}>
    <App />
  </Provider>, document.getElementById('root')
);
