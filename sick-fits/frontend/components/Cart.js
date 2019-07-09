import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import CartStyles from './styles/CartStyles';
import SickButton from './styles/SickButton';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';

// const CURRENT_USER_QUERY = gql`
//   query {
//     me {
//       id
//       email
//       name
//       permissions
//     }
//   }
// `;

const Cart = props => (
  <CartStyles open>
    <header>
      <CloseButton title="close">❌</CloseButton>
      <Supreme>Your Cart</Supreme>
      <p>You Have __ Items in your cart</p>
    </header>

    <footer>
      <p>$10.10</p>
      <SickButton>Checkout</SickButton>
    </footer>
  </CartStyles>
);

export default Cart;
