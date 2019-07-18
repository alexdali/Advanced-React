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

const CartItem = ({ cartItem }) =>
  // console.log('CartItem props.cartItem', cartItem);
  // console.log('CartItem props', props);
  {
    if (!cartItem.item)
      return (
        <CartItemStyle>
          <div>This item has been removed</div>
          <RemoveFromCart id={cartItem.id} />
        </CartItemStyle>
      );
    return (
      <CartItemStyle>
        <img width="100" src={cartItem.item.image} alt={cartItem.item.title} />
        <div className="cart-item-details">
          <h3>{cartItem.item.title}</h3>
          <p>
            {formatMoney(cartItem.quantity * cartItem.item.price)}
            {' - '}
            <em>
              {cartItem.quantity} {'x'} {formatMoney(cartItem.item.price)} each
            </em>
          </p>
        </div>
        <RemoveFromCart id={cartItem.id} />
      </CartItemStyle>
    );
  };
CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired,
};

export default CartItem;
