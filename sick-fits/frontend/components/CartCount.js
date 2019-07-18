import styled from 'styled-components';
import PropTypes from 'prop-types';

const Dot = styled.div`
  background: ${props => props.theme.red};
  color: white;
  border-radius: 50%;

  padding: 0.5rem;
  line-height: 2rem;
  min-width: 3rem;
  margin-left: 1rem;
  font-weight: 100;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
`;

const CartCount = ({ count }) => (
  // console.log('CartCount props.cartitem', cartItem);
  <Dot>{count}</Dot>
);
// CartCount.propTypes = {
//   count: PropTypes.Int.isRequired,
// };

export default CartCount;
