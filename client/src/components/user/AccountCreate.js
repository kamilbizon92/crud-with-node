import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import AccountCreateForm from './AccountCreateForm';

class AccountCreate extends Component {
  state = {
    name: '',
    email: '',
    username: '',
    password: '',
    password2: '',
    errors: []
  }

  componentDidMount() {
    fetch('/users/register')
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        // User is logged in, redirect to home page
        this.props.history.push('/');
      }
    })
    .catch(err => console.log(err));
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();

    fetch('/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.state.name,
        email: this.state.email,
        username: this.state.username,
        password: this.state.password,
        password2: this.state.password2,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Account created
        this.props.history.push({
          pathname: '/users/login',
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
          // Errors in form
          let errors = data.message.map(msg => {
            return [msg.param, msg.msg];
          });
          this.setState({
            errors
          });
        }
      }
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="container">
        <h4>Create account</h4>
        <AccountCreateForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} errors={this.state.errors} />
      </div>
    )
  }
}

export default withRouter(AccountCreate);