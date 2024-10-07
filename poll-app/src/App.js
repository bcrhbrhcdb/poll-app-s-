import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Auth from './components/Auth'
import PollList from './components/PollList'
import Poll from './components/Poll'
import CreatePoll from './components/CreatePoll'

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/create">Create Poll</Link></li>
          </ul>
        </nav>

        <Switch>
          <Route exact path="/" component={PollList} />
          <Route path="/poll/:id" render={(props) => <Poll pollId={props.match.params.id} />} />
          <Route path="/create" component={CreatePoll} />
          <Route path="/auth" component={Auth} />
        </Switch>
      </div>
    </Router>
  )
}

export default App