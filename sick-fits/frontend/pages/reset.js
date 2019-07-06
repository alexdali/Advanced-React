import Reset from '../components/Reset';

const resetPage = props => (
  <>
    <p>ResetToken: {props.query.resetToken}</p>
    <Reset resetToken={props.query.resetToken} />
  </>
);

export default resetPage;
