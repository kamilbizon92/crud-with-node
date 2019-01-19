import { Component } from 'react';
import { withRouter } from 'react-router-dom';

class Logout extends Component {
  componentDidMount() {
    fetch('/users/logout')
    .then(res => res.json())
    .then(data => {
      this.props.history.push({
        pathname: '/',
        state: {
          flash: {
            type: 'green',
            message: data.message
          }
        }
      })
    })
    .catch(err => console.log(err))
  }

  render() {
    return (
      null
    )
  }
}

export default withRouter(Logout);