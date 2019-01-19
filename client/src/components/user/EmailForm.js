import React from 'react';

const EmailForm = ({ handleChange, handleSubmit, value, error }) => {
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="input-field">
          <input onChange={handleChange} type="email" placeholder="Please, type your email" name="email" />
        </div>
        {error ? (<p className="red-text">{error}</p>) : null}
        <div className="input-field">
          <input type="submit" value={value} className="btn" />
        </div>
      </form>
    </div>
  )
}

export default EmailForm;