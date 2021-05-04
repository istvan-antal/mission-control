import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import fetch from 'node-fetch';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fetch = fetch;

const httpLink = createHttpLink({
    uri: process.env.REACT_APP_API_URL || 'https://gitlab.com/api/graphql',
});

export const createClient = () =>
    new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(),
        connectToDevTools: true,
        defaultOptions: {
            query: {
                fetchPolicy: 'network-only',
            },
        },
    });

const client = createClient();

export default client;
