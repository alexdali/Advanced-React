import PleaseSignIn from '../components/PleaseSignin';
import Orders from '../components/Orders';

const OrdersPage = props => (
  <PleaseSignIn>
    <Orders page={parseFloat(props.query.page) || 1} />
  </PleaseSignIn>
);

export default OrdersPage;
