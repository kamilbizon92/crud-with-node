import React from 'react';
import { Link } from 'react-router-dom';

const LoginForm = ({ handleChange, handleSubmit, errors }) => {
  return (
    <div>
      <h3>Log in</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-field">
          <input onChange={handleChange} type="email" placeholder="Email" name="email" />
        </div>
        <div className="input-field">
          <input onChange={handleChange} type="password" placeholder="Password" name="password" />
        </div>
        {
          errors ? (<p className="red-text">{errors}</p>) : null
        }
        <div className="input-field">
          <input type="submit" value="Log in" className="btn" />
        </div>
      </form>
      <div id="recovery">
        <Link to="/users/recovery">Forgot password?</Link>
      </div>
      <div id="activation">
        <Link to="/users/activation">I didn't receive activation email!</Link>
      </div>
    </div>
  )
}

export default LoginForm;