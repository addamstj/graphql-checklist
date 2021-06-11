import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'

const client = new ApolloClient({
  uri: 'https://react-graphql-to-do.herokuapp.com/v1/graphql'
})

// client.query({
//   query: gql`
//     query getTodos {
//       todos {
//     done
//     id
//     text
//   }
// }
//   `
// }).then(data => console.log(data))

ReactDOM.render(<ApolloProvider client={client}><App /></ApolloProvider>, document.getElementById('root'));