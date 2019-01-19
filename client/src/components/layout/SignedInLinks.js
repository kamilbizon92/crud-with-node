import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const SignedInLinks = () => {
  return (
    <ul className="right">
      <li><Link to="/users/account">Check your profile!</Link></li>
      <li><NavLink to="/articles/add">Add article</NavLink></li>
      <li><NavLink to="/users/logout">Log out</NavLink></li>
    </ul>
  )
}

export default SignedInLinks;