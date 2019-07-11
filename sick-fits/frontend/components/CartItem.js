import styled from 'styled-components';
import formatMoney from '../lib/formatMoney';

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
  // <Query {...props} query={CURRENT_USER_QUERY}>
  //   {payload => props.children(payload)}
  // </Query>
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
    </CartItemStyle>
  );
};

// Cart.propTypes = {
//   children: PropTypes.obj.isRequired,
// };

export default CartItem;
