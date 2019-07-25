import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Order from './Order';
import Pagination from './Pagination';
import { perPage } from '../config';

// const ALL_ORDERS_QUERY = gql`
//   query ALL_ORDERS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
//     orders(first: $first, skip: $skip, orderBy: createdAt_DESC) {
//       id
//     }
//   }
// `;
const ALL_ORDERS_QUERY = gql`
  query ALL_ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;

const OrdersList = styled.div`
  /* display: grid;
   grid-template-columns: 1fr 1fr;
   grid-gap: 60px; */
  max-width: ${props => props.theme.maxWidth};
  /* margin: 0 auto; */
`;

class Orders extends Component {
  render() {
    // console.log('Orders component this.props', this.props);
    return (
      <Center>
        {/* <Pagination page={this.props.page} /> */}
        <Query
          query={ALL_ORDERS_QUERY}
          // variables={{
          //   skip: this.props.page * perPage - perPage,
          // }}
        >
          {({ data, error, loading }) => {
            console.log('Orders component data: ', data);
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error: {error.message}</p>;
            const { orders } = data;
            console.log('Orders component data.orders: ', orders);
            return (
              <>
                <div>
                  <h2>Orders total: {orders.length}</h2>
                </div>
                <OrdersList>
                  {orders.map(order => (
                    <Order id={order.id} key={order.id} />
                  ))}
                </OrdersList>
              </>
            );
          }}
        </Query>
        {/* <Pagination page={this.props.page} /> */}
      </Center>
    );
  }
}

export default Orders;
export { ALL_ORDERS_QUERY };
