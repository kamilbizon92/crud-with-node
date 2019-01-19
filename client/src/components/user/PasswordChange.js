import React, { Component } from 'react';

import PasswordChangeForm from './PasswordChangeForm';
import { AuthConsumer } from '../../AuthContext';

class PasswordChange extends Component {
  state = {
    oldPassword: '',
    newPassword: '',
    newPassword2: '',
    errors: []
  }

  componentDidMount() {
    fetch('/users/account/settings/password')
    .then(res => res.json())
    .then(data => {
      // Update global userLogged state
      if (!data.userLogged) {
        this.context.logout();
        this.props.history.push('/');
      } else {
        this.context.login();
      }
    })
    .catch(err => console.log(err));
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    fetch('/users/account/settings/password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        old_password: this.state.oldPassword,
        new_password: this.state.newPassword,
        new_password2: this.state.newPassword2
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // All ok, password has been changed
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
        // Show errors
        let errors = [];
        data.message.map(msg => {
          return errors.push(msg);
        });
        this.setState({errors});
      }
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <PasswordChangeForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} errors={this.state.errors} />
    )
  }
}

PasswordChange.contextType = AuthConsumer;

export default PasswordChange;