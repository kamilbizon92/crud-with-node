import React from 'react';

const FlashMessage = ({ type, message }) => {
  return (
    <div className={`card-panel ${type} darken-1`}>{message}</div>
  )
}

export default FlashMessage;