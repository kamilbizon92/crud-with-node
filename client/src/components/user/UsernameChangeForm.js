import React from 'react';

const UsernameChangeForm = ({ handleChange, handleSubmit, error }) => {
  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="input-field">
          <input onChange={handleChange} type="text" placeholder="Type your new username" name="username" />
        </div>
        {error ? (<p className="red-text">{error}</p>) : null}
        <div className="input-field">
          <input type="submit" value="Change username" className="btn" />
        </div>
      </form>
    </div>
  )
}

export default UsernameChangeForm;