import {
    ApolloClient,
    InMemoryCache,
    createHttpLink,
    ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import fetch from 'node-fetch';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fetch = fetch;

const httpLink = createHttpLink({
    uri: process.env.REACT_APP_API_URL || 'https://gitlab.com/api/graphql',
});

const withToken = setContext(() => {
    const result: {
        headers: {
            Authorization?: string;
            'X-Access-Token'?: string;
        };
    } = {
        headers: {},
    };

    const accessToken = process.env.GITLAB_ACCESS_TOKEN;

    if (accessToken) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        result.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return result;
});

const link = ApolloLink.from([withToken, httpLink]);

export const createClient = () =>
    new ApolloClient({
        link,
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
