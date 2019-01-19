import React, { Component } from 'react';

import UserAccountView from './UserAccountView';
import FlashMessage from '../layout/FlashMessage';
import { AuthConsumer } from '../../AuthContext';

class UserAccount extends Component {
  state = {
    username: ''
  }

  componentDidMount() {
    fetch('/users/account')
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
    let flash;
    if (this.props.location.state) {
      let flashMessage = this.props.location.state.flash.message;
      let flashType = this.props.location.state.flash.type;
      flash = <FlashMessage message={flashMessage} type={flashType} />
    } else {
      flash = null;
    }
    return (
      <div className="container">
        {flash}
        <UserAccountView username={this.state.username} />
      </div>
    )
  }
}

UserAccount.contextType = AuthConsumer;

export default UserAccount;