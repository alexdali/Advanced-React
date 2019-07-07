import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
];

const ALL_USER_QUERY = gql`
  query {
    users {
      id
      email
      name
      permissions
    }
  }
`;

const Permissions = props => (
  <Query query={ALL_USER_QUERY}>
    {({ data, error }) => (
      <div>
        <Error error={error} />
        <div>
          <h2>Manage permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                {possiblePermissions.map(item => (
                  <th key={item}>{item}</th>
                ))}
                <th>👇</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <User user={user} key={user.id} />
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
);

class User extends Component {
  render() {
    const { user } = this.props;
    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map(permission => (
          <td key={permission}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input
                type="checkbox"
                name={`${user.id}-permission-${permission}`}
              />
            </label>
          </td>
        ))}
        <td>
          <SickButton>Update</SickButton>
        </td>
      </tr>
    );
  }
}

export default Permissions;
