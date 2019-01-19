import React from 'react';

import Error from '../layout/Error';

const AddArticleForm = ({ handleChange, handleSubmit, errors }) => {
  // Map all errors and show in appropriate place on the page
  let titleError;
  let bodyError;
  errors.map(error => {
    if (error[0] === 'title') {
      return titleError = <Error error={error[1]} />
    } else if (error[0] === 'body'){
      return bodyError = <Error error={error[1]} />
    }
    return null;
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-field">
        <input onChange={handleChange} type="text" name="title" placeholder="Article title" />
      </div>
      {titleError}
      <div className="input-field">
        <textarea onChange={handleChange} name="body" placeholder="Content" className="materialize-textarea"></textarea>
      </div>
      {bodyError}
      <div className="input-field">
        <input type="submit" value="Add article" className="btn" />
      </div>
    </form>
  )
}

export default AddArticleForm;