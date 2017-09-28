import { Router, Route, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import store from './store';
import 'bootstrap/dist/css/bootstrap.css';

import App from './components/App/App';

document.addEventListener('DOMContentLoaded', () => ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={App} />
      <Route path="/:page" component={App} />
    </Router>
  </Provider>, document.getElementById('app')));
