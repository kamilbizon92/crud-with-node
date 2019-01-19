import React, { Component } from 'react';

import SingleArticleShow from './SingleArticleShow';
import { AuthConsumer } from '../../AuthContext';

class SingleArticle extends Component {
  state = {
    article: {},
    author: '',
    correctUser: false
  }

  componentDidMount() {
    fetch(this.props.location.pathname)
      .then(res => res.json())
      .then(data => {
        // Fetch on load and write to state
        if (data.success) {
          this.setState({
            article: data.article,
            author: data.author
          });
        }

        // Check if user is author of article
        if (data.correctUser) {
          this.setState({
            correctUser: true
          });
        }
        
        // Update global userLogged state
        if (data.userLogged) {
          this.context.login();
        } else {
          this.context.logout();
        }
      })
      .catch(err => console.log(err));
  }

  handleClick = (e) => {
    const articleId = e.target.getAttribute('data-id');
    
    fetch(`/articles/${articleId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
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
        // Redirect to home page and show flash message
        this.props.history.push({
          pathname: '/',
          state: {
            flash: {
              type: 'orange',
              message: data.flash
            }
          }
        });
      } else {
        this.props.history.push({
          pathname: '/',
          state: {
            flash: {
              type: 'red',
              message: 'Access denied!'
            }
          }
        })
      }
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="container">
        <SingleArticleShow state={this.state} handleClick={this.handleClick} correctUser={this.state.correctUser} />
      </div>
    )
  }
}

SingleArticle.contextType = AuthConsumer;

export default SingleArticle;