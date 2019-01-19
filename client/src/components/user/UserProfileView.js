import React from 'react';
import { Link } from 'react-router-dom';

const UserProfileView = ({ articles }) => {
  const articlesList = articles.length ? (
    articles.map(article => {
      return (
        <li className="collection-item" key={article.id}>
          <Link to={`/articles/${article.id}`}>{article.title}</Link>
        </li>
      )
    })
  ) : (
    <div className="center">User has zero activity!</div>
  )
  return (
    <div className="container">
      <ul className="collection">
        {articlesList}
      </ul>
    </div>
  )
}

export default UserProfileView;