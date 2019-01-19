import React, { Component } from 'react';

import UserSettingsView from './UserSettingsView';
import { AuthConsumer } from '../../AuthContext';

class UserSettings extends Component {
  state = {
    username: ''
  }

  componentDidMount() {
    fetch('/users/account/settings')
    .then(res => res.json())
    .then(data => {
      // Update global userLogged state
      if (!data.userLogged) {
        this.context.logout();
      } else {
        this.context.login();
      }
      
      if (data.success) {
        this.setState({
          username: data.username
        });
      } else {
        this.props.history.push('/');
      }
    })
    .catch(err => console.log(err));
  }
  
  render() {
    return (
      <UserSettingsView username={this.state.username} />
    )
  }  
}

UserSettings.contextType = AuthConsumer;

export default UserSettings;