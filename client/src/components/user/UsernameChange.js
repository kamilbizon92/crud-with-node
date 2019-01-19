import React, { Component } from 'react';

import UsernameChangeForm from './UsernameChangeForm';
import { AuthConsumer } from '../../AuthContext';

class UsernameChange extends Component {
  state = {
    username: '',
    error: ''
  }
  
  componentDidMount() {
    fetch('/users/account/settings/username')
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
      username: e.target.value
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    fetch('/users/account/settings/username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.state.username
      })
    })
    .then(res => res.json())
    .then(data => {
      // Redirect to user account when username updated successfully
      if (data.success) {
        this.props.history.push({
          pathname: '/users/account',
          state: {
            flash: {
              type: 'green',
              message: data.message
            }
          }
        });
      } else {
        // Show error if exist
        let error = data.message[0].msg;
        this.setState({
          error
        });
      }
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <UsernameChangeForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} error={this.state.error} />
    )
  }
}

UsernameChange.contextType = AuthConsumer;

export default UsernameChange;