import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import CartStyles from './styles/CartStyles';
import SickButton from './styles/SickButton';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import { CURRENT_USER_QUERY } from './User';
import User from './User';
import CartItem from './CartItem';
import formatMoney from '../lib/formatMoney';
import calcTotalPrice from '../lib/calcTotalPrice';

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

const Cart = props => (
  <User query={CURRENT_USER_QUERY}>
    {({ data: { me } }) => {
      console.log('Cart me', me);
      if (!me) return null;
      return (
        <Mutation mutation={TOGGLE_CART_MUTATION}>
          {toggleCart => (
            <Query query={LOCAL_STATE_QUERY}>
              {({ data }) => (
                <CartStyles open={data.cartOpen}>
                  <header>
                    <CloseButton onClick={toggleCart} title="close">
                      ❌
                    </CloseButton>
                    <Supreme>{me.name}'s Cart</Supreme>
                    <p>
                      You Have {me.cart.length} Item
                      {me.cart.length === 1 ? '' : 's'} in your cart
                    </p>
                  </header>
                  <ul>
                    {me.cart.map(cartitem => (
                      <CartItem key={cartitem.id} cartitem={cartitem} />
                    ))}
                  </ul>
                  <footer>
                    <p>{formatMoney(calcTotalPrice(me.cart))}</p>
                    <SickButton>Checkout</SickButton>
                  </footer>
                </CartStyles>
              )}
            </Query>
          )}
        </Mutation>
      );
    }}
  </User>
);

export default Cart;
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION };
