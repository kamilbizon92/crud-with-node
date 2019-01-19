import { Component } from 'react';
import { withRouter } from 'react-router-dom';

class AccountActivationHash extends Component {
  componentDidMount() {
    fetch(this.props.location.pathname)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        this.props.history.push({
          pathname: '/users/login',
          state: {
            flash: {
              type: 'green',
              message: data.message
            }
          }
        });
      } else {
        this.props.history.push({
          pathname: '/',
          state: {
            flash: {
              type: 'orange',
              message: data.message
            }
          }
        });
      }
    })
    .catch(err => console.log(err))
  }

  render () {  
    return (
      null
    )
  }
}

export default withRouter(AccountActivationHash);