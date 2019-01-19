import React, { Component } from 'react';

const AuthContext = React.createContext();

// Provide global state and methods
class AuthProvider extends Component {
  state = {
    isAuth: false
  }

  login = () => {
    this.setState({
      isAuth: true
    });
  }

  logout = () => {
    this.setState({
      isAuth: false
    });
  }

  render() {
    return (
      <AuthContext.Provider value={{
          isAuth: this.state.isAuth,
          login: this.login,
          logout: this.logout
        }}>
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

const AuthConsumer = AuthContext.Consumer;

export { AuthProvider, AuthConsumer };