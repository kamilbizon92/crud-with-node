import React from 'react';
import { NavLink } from 'react-router-dom';

const SignedOutLinks = () => {
  return (
    <ul className="right">
      <li><NavLink to="/users/register">Create Account</NavLink></li>
      <li><NavLink to="/users/login">Log in</NavLink></li>
    </ul>
  )
}

export default SignedOutLinks;