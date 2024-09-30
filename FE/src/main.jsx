import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import App from './App.jsx';
import store from './redux/store';
import './index.css';

const client = new ApolloClient({
  uri: import.meta.env.VITE_BE_URL + 'graphql',
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <Provider store={store}>
        <App />
      </Provider>
    </ApolloProvider>
  </StrictMode>,
);
