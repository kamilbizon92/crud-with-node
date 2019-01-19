import React, { Component } from 'react';

import { AuthConsumer } from '../../AuthContext';
import UserProfileView from './UserProfileView';

class UserProfile extends Component {
  state = {
    articles: []
  }

  componentDidMount() {
    fetch(this.props.location.pathname)
    .then(res => res.json())
    .then(data => {
      // Update global userLogged state
      if (!data.userLogged) {
        this.context.logout();
      } else {
        this.context.login();
      }

      if (data.success) {
        // If user exists, add to state all user articles
        this.setState({
          articles: data.message.articles
        });
      } else {
        // When user does not exists, redirect to home page and show flash message
        this.props.history.push({
          pathname: '/',
          state: {
            flash: {
              type: 'orange',
              message: data.message
            }
          }
        });
      }
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <UserProfileView articles={this.state.articles} />
    )
  }
}

UserProfile.contextType = AuthConsumer;

export default UserProfile;