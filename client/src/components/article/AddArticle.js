import React, { Component } from 'react';

import AddArticleForm from './AddArticleForm';
import { AuthConsumer } from '../../AuthContext';

class AddArticle extends Component {
  state = {
    title: '',
    body: '',
    errors: []
  }
  
  componentDidMount() {
    // Check if user is logged in
    fetch('/articles/add')
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        this.props.history.push({
          pathname: '/users/login',
          state: {
            flash: {
              type: 'red',
              message: data.flash
            }
          }
        });
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

    // Reset errors when user submit the form
    this.setState({errors: []});

    // Add article to database
    fetch('/articles/add', {
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

      // If article was added, redirect to home page
      if (data.success) {
        this.props.history.push({
          pathname: '/',
          state : {
            flash: {
              type: 'green',
              message: data.flash
            }
          }
        });
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
        <h4>Add article</h4>
        <AddArticleForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} errors={this.state.errors} />
      </div>
    )
  }
}

AddArticle.contextType = AuthConsumer;

export default AddArticle;