import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PasswordRecoveryHashForm from './PasswordRecoveryHashForm';

class PasswordRecoveryHash extends Component {
  state = {
    password: '',
    password2: '',
    errors: []
  }

  componentDidMount() {
    fetch(this.props.location.pathname)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        this.props.history.push({
          pathname: '/',
          state: {
            flash: {
              type: 'red',
              message: data.message
            }
          }
        });
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

    fetch(this.props.location.pathname, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: this.state.password,
        password2: this.state.password2
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
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
        // If recovery token expired, redirect to home page ang show flash message
        if (data.expired) {
          this.props.history.push({
            pathname: '/',
            state: {
              flash: {
                type: 'orange',
                message: data.message
              }
            }
          });
        } else {
          // Show form errors
          let errors = [];
          data.message.map(msg => {
            return errors.push(msg);
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
      <PasswordRecoveryHashForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} errors={this.state.errors} />
    )
  }
}

export default withRouter(PasswordRecoveryHash);