import React from 'react';
import { Link } from 'react-router-dom';

const ArticleList = ({articles}) => {
  return (
     <ul className="collection">
      {
        articles && articles.map(article => {
          return (
            <li className="collection-item" key={article.id}>
              <Link to={`/articles/${article.id}`} >
                {article.title}
              </Link>
            </li>
          )
        })
      }
     </ul>
  )
}

export default ArticleList;