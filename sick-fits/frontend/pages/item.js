import SingleItem from '../components/SingleItem';

const Home = props => (
  <div>
    <SingleItem id={props.query.id}>Item: ID</SingleItem>
  </div>
);

export default Home;
