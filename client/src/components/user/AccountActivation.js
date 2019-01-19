import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import EmailForm from './EmailForm';

class AccountActivation extends Component {
  state = {
    email: '',
    error: []
  }

  componentDidMount() {
    fetch('/users/activation')
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        this.props.history.push('/');
      }
    })
    .catch(err => console.log(err));
  }

  handleChange = (e) => {
    this.setState({
      email: e.target.value
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    fetch('/users/activation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.state.email
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        this.props.history.push({
          pathname: '/',
          state: {
            flash: {
              type: 'green',
              message: data.message
            }
          }
        });
      } else {
        if (data.userLogged) {
          this.props.history.push('/');
        } else {
          let error = data.message;
          this.setState({
            error
          });
        }
      }
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="container">
        <h4>Account activation</h4>
        <EmailForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} value="Send me activation email" error={this.state.error} />
      </div>
    )
  }
}

export default withRouter(AccountActivation);