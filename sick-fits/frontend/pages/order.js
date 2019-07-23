import PleaseSignIn from '../components/PleaseSignin';

const Order = props => (
  <PleaseSignIn>
    <p>This is order ${props.order.id}</p>
  </PleaseSignIn>
);

export default Order;
