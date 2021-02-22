import { gql, useQuery } from '@apollo/client';
import { Text } from '@nodegui/react-nodegui';
import React from 'react';
import client from '../client';
import { activate, deactivate } from '../systray';

const query = gql`
    query mergeRequests($fullPath: ID!) {
        currentUser {
            username
        }
        group(fullPath: $fullPath) {
            mergeRequests(state: opened) {
                nodes {
                    id
                    workInProgress
                    mergeableDiscussionsState
                    approvalsLeft
                    webUrl
                    title
                    author {
                        name
                    }
                    reviewers {
                        nodes {
                            username
                        }
                    }
                    approvedBy {
                        nodes {
                            username
                        }
                    }
                }
            }
        }
    }
`;

interface QueryResult {
    currentUser: {
        username: string;
    };
    group: {
        mergeRequests: {
            nodes: {
                id: string;
                workInProgress: boolean;
                mergeableDiscussionsState: boolean;
                approvalsLeft: number;
                webUrl: string;
                title: string;
                author: {
                    name: string;
                };
                reviewers: {
                    nodes: {
                        username: string;
                    }[];
                };
                approvedBy: {
                    nodes: {
                        username: string;
                    }[];
                };
            }[];
        };
    };
}

const MergeRequestsTodo = () => {
    const { data, error, loading } = useQuery<QueryResult>(query, {
        variables: {
            fullPath: process.env.GITLAB_MR_GROUP,
        },
        pollInterval: 5000,
        client,
    });
    const mergeRequestsOfInterest =
        data?.group.mergeRequests.nodes
            .filter(mr => !mr.workInProgress)
            .filter(mr => mr.mergeableDiscussionsState)
            .filter(mr => mr.approvalsLeft <= 1)
            .filter(mr =>
                mr.reviewers.nodes
                    .map(item => item.username)
                    .includes(data.currentUser.username)
            )
            .filter(
                mr =>
                    !mr.approvedBy.nodes
                        .map(item => item.username)
                        .includes(data.currentUser.username)
            ) ?? [];

    if (error) {
        console.error(error);
    }
    console.log('Update', mergeRequestsOfInterest.length);
    console.log(mergeRequestsOfInterest);

    if (mergeRequestsOfInterest.length) {
        activate();
    } else {
        deactivate();
    }

    return (
        <Text openExternalLinks>
            {mergeRequestsOfInterest.map(
                item => `<a href="${item.webUrl}">${item.title}</a>`
            )}
        </Text>
    );
};

export default MergeRequestsTodo;
