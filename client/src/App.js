import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Articles from './components/article/Articles';
import SingleArticle from './components/article/SingleArticle';
import Login from './components/user/Login';
import PasswordRecovery from './components/user/PasswordRecovery';
import AccountActivation from './components/user/AccountActivation';
import AccountCreate from './components/user/AccountCreate';
import AccountActivationHash from './components/user/AccountActivationHash';
import AddArticle from './components/article/AddArticle';
import EditArticle from './components/article/EditArticle';
import PasswordRecoveryHash from './components/user/PasswordRecoveryHash';
import UserAccount from './components/user/UserAccount';
import UserSettings from './components/user/UserSettings';
import UserProfile from './components/user/UserProfile';
import Logout from './components/user/Logout';
import UsernameChange from './components/user/UsernameChange';
import PasswordChange from './components/user/PasswordChange';

import { AuthProvider } from './AuthContext';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <AuthProvider>
          <div className="App">
            <Navbar />
            <Switch>
              <Route exact path="/" component={Articles} />
              <Route path="/articles/add" component={AddArticle} />
              <Route path="/articles/edit/:id" component={EditArticle} />
              <Route path="/articles/:id" component={SingleArticle} />
              <Route path="/users/login" component={Login} />
              <Route path="/users/logout" component={Logout} />
              <Route path="/users/account/settings/username" component={UsernameChange} />
              <Route path="/users/account/settings/password" component={PasswordChange} />
              <Route path="/users/account/settings" component={UserSettings} />
              <Route path="/users/account" component={UserAccount} />
              <Route path="/users/profile/:username" component={UserProfile} />
              <Route path="/users/recovery/:hash" component={PasswordRecoveryHash} />
              <Route path="/users/recovery" component={PasswordRecovery} />
              <Route path="/users/activation" component={AccountActivation} />
              <Route path="/users/register/:hash" component={AccountActivationHash} />
              <Route path="/users/register" component={AccountCreate} />
            </Switch>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    );
  }
}

export default App;
