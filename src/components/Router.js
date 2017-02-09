import React, { Component } from 'react'
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router'


import App from "./App.js"

class ReactRouter extends Component {

	render() {
		return(
			<Router history={hashHistory}>
			<Route path='/' component={App} />

			{/* 404 not fond page, make sure it stay at bottom */}
        	<Route path='*' component={NotFound} />
			</Router>
		)
		


	}


}


// Hard coded pages (TEMP!)
const NotFound = () => <h1>404.. This page is not found!</h1>

export default ReactRouter
