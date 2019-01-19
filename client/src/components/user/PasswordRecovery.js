import React, { Component } from 'react';

import EmailForm from './EmailForm';

class PasswordRecovery extends Component {
  state = {
    email: '',
    error: ''
  }

  componentDidMount() {
    fetch('/users/recovery')
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

    fetch('/users/recovery', {
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
        }
        let error = data.message;
        console.log(error)
        this.setState({
          error
        });
      }
    })
    .catch(err => console.log(err));
  }

  render () {
    return (
      <div className="container">
        <h4>Password recovery</h4>
        <EmailForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} error={this.state.error} value="Recover password!" />
      </div>
    )
  }
}

export default PasswordRecovery;