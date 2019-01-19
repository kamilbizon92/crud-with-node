import React from 'react';
import { Link } from 'react-router-dom';

import SignedInLinks from './SignedInLinks';
import SignedOutLinks from './SignedOutLinks';
import { AuthConsumer } from '../../AuthContext';

const Navbar = () => {
  return (
    <AuthConsumer>
      {
        ({ isAuth }) => (
          <nav className="nav-wrapper grey darken-3">
            <div className="container">
              <Link to="/" >Home</Link>
              {
                isAuth ? <SignedInLinks /> : <SignedOutLinks />
              }
            </div>
          </nav>
        )
      }
      
    </AuthConsumer>
  )
}

export default Navbar;