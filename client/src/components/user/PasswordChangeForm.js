import React from 'react';

import Error from '../layout/Error';

const PasswordChangeForm = ({ handleChange, handleSubmit, errors }) => {
  // Map all errors and show in appropriate place on the page
  let oldPasswordError, newPasswordError, newPassword2Error;
  errors.map(error => {
    switch (error.param) {
      case 'old_password':
        return oldPasswordError = <Error error={error.msg} />
      case 'new_password': 
        return newPasswordError = <Error error={error.msg} />
      case 'new_password2':
        return newPassword2Error = <Error error={error.msg} />
      default:
        return null;
    }
  })

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
       <div className="input-field">
          <input onChange={handleChange} type="password" name="oldPassword" placeholder="Type your old password" />
        </div>
        {oldPasswordError}
        <div className="input-field">
          <input onChange={handleChange} type="password" name="newPassword" placeholder="Type your new password" />
        </div>
        {newPasswordError}
        <div className="input-field">
          <input onChange={handleChange} type="password" name="newPassword2" placeholder="Confirm your new password" />
        </div>
        {newPassword2Error}
        <div className="input-field">
          <input type="submit" value="Change password" className="btn" />
        </div>
      </form>
    </div>
  )
}

export default PasswordChangeForm;