import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import EditArticleForm from './EditArticleForm';
import { AuthConsumer } from '../../AuthContext';

class EditArticle extends Component {
  state = {
    title: '',
    body: '',
    errors: []
  }

  componentDidMount() {
    // Check if user is logged in
    fetch(this.props.location.pathname)
    .then(res => res.json())
    .then(data => {
      // Update global userLogged state
      if (data.userLogged) {
        this.context.login();
      } else {
        this.context.logout();
      }

      if (!data.success) {
        if (data.userLogged) {
          this.props.history.push({
            pathname: '/',
            state: {
              flash: {
                type: 'red',
                message: data.flash
              }
            }
          });
        } else {
          this.props.history.push({
            pathname: '/users/login',
            state: {
              flash: {
                type: 'red',
                message: data.flash
              }
            }
          });
        }
      } else {
        this.setState({
          title: data.article.title,
          body: data.article.body
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

    // Reset errors when user submit the form
    this.setState({errors: []});
    
    // Edit article
    fetch(this.props.location.pathname, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: this.state.title,
        body: this.state.body
      })
    })
    .then(res => res.json())
    .then(data => {
      // Update global userLogged state
      if (!data.userLogged) {
        this.context.logout();
      } else {
        this.context.login();
      }

      if (data.success) {
        this.props.history.push({
          pathname: '/',
          state: {
            flash: {
              type: 'green',
              message: data.flash
            }
          }
        })
      } else {
        // Update errors
        let errors = data.message.map(message => {
          return [message.param, message.msg];
        });
        this.setState({
          errors
        });
      }
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="container">
        <EditArticleForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} article={this.state} />
      </div>
    )
  }
}

EditArticle.contextType = AuthConsumer;

export default withRouter(EditArticle);