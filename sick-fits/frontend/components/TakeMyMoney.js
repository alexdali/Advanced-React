import React, { Component } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import { Mutation } from 'react-apollo';
import NProgress from 'nprogress';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';

// const SEARCH_ITEMS_QUERY = gql`
//   query SEARCH_ITEMS_QUERY($searchTerm: String!) {
//     items(
//       where: {
//         OR: [
//           { title_contains: $searchTerm }
//           { description_contains: $searchTerm }
//         ]
//       }
//     ) {
//       id
//       image
//       title
//     }
//   }
// `;

function totalItems(cart) {
  // console.log('totalItems', cart);
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

class TakeMyMoney extends Component {
  onToken = res => {
    console.log('TakeMyMoney', res);
  };

  render() {
    // console.log();
    return (
      <User>
        {({ data: { me } }) => (
          <StripeCheckout
            amount={calcTotalPrice(me.cart)}
            name="Sick Fits"
            description={`Order of ${totalItems(me.cart)} items!`}
            image={me.cart[0].item && me.cart[0].item.image}
            stripeKey="pk_test_zicXw2JjcZpRIghASqonKf6h00UZJbZQDH"
            currency="USD"
            email={me.email}
            token={res => this.onToken(res)}
          >
            {this.props.children}
          </StripeCheckout>
        )}
      </User>
    );
  }
}

export default TakeMyMoney;
