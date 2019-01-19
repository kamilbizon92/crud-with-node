import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import LoginForm from './LoginForm';
import { AuthConsumer } from '../../AuthContext';
import FlashMessage from '../layout/FlashMessage';

class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: []
  }

  componentDidMount() {
    fetch('/users/login')
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
      [e.target.name]: e.target.value
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    fetch('/users/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json text/plain */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password
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
              message: 'You are logged in!'
            }
          }
        });
        this.context.login();
      } else {
        let errors = [data.message];
        this.setState({
          errors
        });
      }
    })
    .catch(err => console.log(err));
  }

  render () {
    let flash;
    if (this.props.location.state) {
      let flashMessage = this.props.location.state.flash.message;
      let flashType = this.props.location.state.flash.type;
      flash = <FlashMessage message={flashMessage} type={flashType} />
    }
    return (
      <div className="container">
        {flash}
        <LoginForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} errors={this.state.errors} />
      </div>
    )
  }
}

Login.contextType = AuthConsumer;

export default withRouter(Login);