import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
// import Pagination from './Pagination';
// import { perPage } from '../config';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import Error from './ErrorMessage';
import Order from './Order';
import formatMoney from '../lib/formatMoney';
import OrderItemStyles from './styles/OrderItemStyles';

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
      total
      createdAt
      items {
        id
        title
        price
        description
        quantity
        image
      }
    }
  }
`;

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
  /* max-width: ${props => props.theme.maxWidth}; */
  /* margin: 0 auto; */
`;

class OrderList extends Component {
  render() {
    // console.log('OrderList component this.props', this.props);
    return (
      // <Pagination page={this.props.page} />
      <Query
        query={ALL_ORDERS_QUERY}
        // variables={{
        //   skip: this.props.page * perPage - perPage,
        // }}
      >
        {({ data: { orders }, error, loading }) => {
          // console.log('OrderList component data: ', data);
          if (loading) return <p>Loading...</p>;
          if (error) return <Error error={error} />;
          // console.log('OrderList component data.orders: ', orders);
          return (
            <div>
              <h2>Order List total: {orders.length}</h2>
              <OrderUl>
                {orders.map(order => (
                  <OrderItemStyles key={order.id}>
                    <Link
                      href={{
                        pathname: '/order',
                        query: { id: order.id },
                      }}
                    >
                      <a>
                        <div className="order-meta">
                          <p>
                            {order.items.reduce((a, b) => a + b.quantity, 0)}{' '}
                            Items
                          </p>
                          <p>{order.items.length} positions</p>
                          <p>
                            {formatDistance(order.createdAt, new Date())} ago
                          </p>
                          <p>{formatMoney(order.total)}</p>
                        </div>
                        <div className="images">
                          {order.items.map(item => (
                            <picture key={item.id}>
                              <img
                                key={item.id}
                                src={item.image}
                                alt={item.title}
                              />
                              {order.items.length > 1 && (
                                <span>{item.quantity} items</span>
                              )}
                            </picture>
                          ))}
                        </div>
                      </a>
                    </Link>
                  </OrderItemStyles>
                ))}
              </OrderUl>
            </div>
          );
        }}
      </Query>
      // <Pagination page={this.props.page} />
    );
  }
}

export default OrderList;
export { ALL_ORDERS_QUERY };
