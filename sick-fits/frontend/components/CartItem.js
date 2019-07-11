import styled from 'styled-components';
import PropTypes from 'prop-types';
import formatMoney from '../lib/formatMoney';
import RemoveFromCart from './RemoveFromCart';

const CartItemStyle = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3,
  p {
    margin: 0;
  }
`;

const CartItem = ({ cartitem }) => {
  console.log('CartItem props.cartitem', cartitem);
  return (
    <CartItemStyle>
      <img width="100" src={cartitem.item.image} alt={cartitem.item.title} />
      <div className="cart-item-details">
        <h3>{cartitem.item.title}</h3>
        <p>
          {formatMoney(cartitem.quantity * cartitem.item.price)}
          {' - '}
          <em>
            {cartitem.quantity} {'x'} {formatMoney(cartitem.item.price)} each
          </em>
        </p>
      </div>
      <RemoveFromCart id={cartitem.id} />
    </CartItemStyle>
  );
};

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired,
};

export default CartItem;
