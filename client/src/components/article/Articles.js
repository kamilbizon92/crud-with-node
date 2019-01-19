import React, { Component } from 'react';

import ArticleList from './ArticleList';
import FlashMessage from '../layout/FlashMessage';
import { AuthConsumer } from '../../AuthContext';

class Articles extends Component {
  state = {
    articles: []
  }

  componentDidMount() {
    fetch('/articles')
    .then(res => res.json())
    .then(data => {
      // Update global userLogged state
      if (data.userLogged) {
        this.context.login();
      } else {
        this.context.logout();
      }
      this.setState({
        articles: data.articles
      });
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
        <ArticleList articles={this.state.articles} />
      </div>
    )
  }
}

Articles.contextType = AuthConsumer;

export default Articles;