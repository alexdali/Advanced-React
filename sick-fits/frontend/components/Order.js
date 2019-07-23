import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Order extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };

  render() {
    return <p>Order ${this.props.id}</p>;
  }
}

export default Order;
