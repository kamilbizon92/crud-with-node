import React from 'react';
import { Link } from 'react-router-dom';

const SingleArticleShow = (props) => {
  const { author, article, correctUser } = props.state;
  const { handleClick } = props;
  
  return (
    <div className="card z-depth-0 single-article">
      <div className="card-content grey-text text-darken-3">
        <span className="card-title">{article.title}</span>
        <p>{article.body}</p>
        <p>Posted by {author}</p>
        <p className="grey-text">{article.createdAt}</p>
        {
          correctUser ? (
            <div>
              <Link to={`/articles/edit/${article.id}`} className="btn">Edit</Link>
              <Link to="#" onClick={handleClick} data-id={article.id} className="btn red">Delete</Link>
            </div>
          ) : null
        }
      </div>
    </div>
  )
}

export default SingleArticleShow;