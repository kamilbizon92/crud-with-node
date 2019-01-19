import React from 'react';

import Error from '../layout/Error';

const AccountCreateForm = ({ handleChange, handleSubmit, errors }) => {
  // Map all errors and show in appropriate place on the page
  let nameError, emailError, usernameError, passwordError, password2Error;
  
  errors.map(error => {
    switch(error[0]) {
      case 'name':
        return nameError = <Error error={error[1]} />
      case 'email':
        return emailError = <Error error={error[1]} />
      case 'username':
        return usernameError = <Error error={error[1]} />
      case 'password':
        return passwordError = <Error error={error[1]} />
      case 'password2':
        return password2Error = <Error error={error[1]} />
      default:
        return null;
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-field">
        <input onChange={handleChange} type="text" name="name" placeholder="Your name" />
      </div>
      {nameError}
      <div className="input-field">
        <input onChange={handleChange} type="text" name="email" placeholder="Your email address" />
      </div>
      {emailError}
      <div className="input-field">
        <input onChange={handleChange} type="text" name="username" placeholder="Your username" />
      </div>
      {usernameError}
      <div className="input-field">
        <input onChange={handleChange} type="password" name="password" placeholder="Type your password" />
      </div>
      {passwordError}
      <div className="input-field">
        <input onChange={handleChange} type="password" name="password2" placeholder="Confirm your password" />
      </div>
      {password2Error}
      <div className="input-field">
        <input type="submit" value="Create account" className="btn" />
      </div>
    </form>
  )
}

export default AccountCreateForm;