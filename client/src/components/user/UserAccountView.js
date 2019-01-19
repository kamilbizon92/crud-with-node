import React from 'react';
import { Link } from 'react-router-dom';

const UserAccountView = ({ username }) => {
  return (
    <div className="container">
      <div className="row">
        <div className="col s6">
          <Link to={`/users/profile/${username}`}>User activity</Link>
        </div>
        <div className="col s6">
          <Link to="/users/account/settings">Settings</Link>
        </div>
      </div>
    </div>
  )
}

export default UserAccountView;