import React from 'react';
import { Link } from 'react-router-dom';

const UserSettingsView = ({ username }) => {
  return (
    <div className="container">
      <h5>Hello, {username} on your settings page</h5>
      <ul className="collection">
        <li className="collection-item">
          <Link to="/users/account/settings/username">Change username</Link>
        </li>
        <li className="collection-item">
          <Link to="/users/account/settings/password">Change password</Link>
        </li>
        <li className="collection-item">
          <Link to="/users/account/">Back to profile</Link>
        </li>
      </ul>      
    </div>
  )
}

export default UserSettingsView;