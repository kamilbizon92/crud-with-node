import React from 'react';

import Error from '../layout/Error';

const PasswordRecoveryHashForm = ({ handleChange, handleSubmit, errors }) => {
  // Map all errors and show in appropriate place on the page
  let passwordError, password2Error;
  errors.map(error => {
    if (error.param === 'password') {
      return passwordError = <Error error={error.msg} />
    } else {
      return password2Error = <Error error={error.msg} />
    }
  });

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="input-field">
          <input onChange={handleChange} type="password" name="password" placeholder="Type your new password" />
        </div>
        {passwordError}
        <div className="input-field">
          <input onChange={handleChange} type="password" name="password2" placeholder="Confirm password" />
        </div>
        {password2Error}
        <input type="submit" className="btn" value="Change password" />
      </form>
    </div>
  )
}

export default PasswordRecoveryHashForm;