import React, { Component } from 'react';
import Downshift from 'downshift';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import debounce from 'lodash.debounce';
import gql from 'graphql-tag';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      image
      title
    }
  }
`;

class Autocomplete extends Component {
  state = {
    items: [],
    loading: false,
  };

  onChange = debounce(async (e, client) => {
    console.log('onchange handler ...');
    // console.log(client);
    this.setState({ loading: true });
    // manually set query
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value },
    });
    console.log('onchange res', res);
    this.setState({
      items: res.data.items,
      loading: false,
    });
  }, 350);

  render() {
    // console.log();
    return (
      <SearchStyles>
        <div>
          <ApolloConsumer>
            {client => (
              <input
                type="search"
                onChange={e => {
                  e.persist();
                  this.onChange(e, client);
                }}
              />
            )}
          </ApolloConsumer>
        </div>
        <DropDown>
          {this.state.items.map(item => (
            <DropDownItem key={item.id}>
              <img width="25" src={item.image} alt={item.title} />
              {item.title}
            </DropDownItem>
          ))}
        </DropDown>
      </SearchStyles>
    );
  }
}

export default Autocomplete;
