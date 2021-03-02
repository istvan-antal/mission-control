/* eslint-disable max-lines */
/* eslint-disable max-statements */
import { gql, useQuery } from '@apollo/client';
import { Text, View } from '@nodegui/react-nodegui';
import { DateTime } from 'luxon';
import React from 'react';
import assert from '../assert';
import client from '../client';

const milestonesQuery = gql`
    query milestones($fullPath: ID!) {
        project(fullPath: $fullPath) {
            id
            name
            milestones(state: active) {
                nodes {
                    id
                    title
                    webPath
                    startDate
                    dueDate
                }
            }
        }
    }
`;

interface MilestoneListResult {
    project: {
        milestones: {
            nodes: {
                id: string;
                title: string;
                startDate: string;
                dueDate: string;
                webPath: string;
            }[];
        };
    };
}

const milestoneIssuesQuery = gql`
    query milestoneIssuesQuery($milestoneTitle: [String]) {
        project(fullPath: "hostettler-ag/dev/middleware") {
            id
            name
            issues(milestoneTitle: $milestoneTitle) {
                nodes {
                    id
                    state
                    timeEstimate
                    totalTimeSpent
                    assignees {
                        nodes {
                            username
                            name
                        }
                    }
                    title
                    labels {
                        nodes {
                            title
                        }
                    }
                    webUrl
                }
            }
        }
    }
`;

interface Milestone {
    id: string;
    title: string;
    startDate: string;
    dueDate: string;
    webPath: string;
}

interface MilestoneIssuesResult {
    project: {
        id: string;
        name: string;
        issues: {
            nodes: {
                id: string;
                state: 'opened' | 'closed';
                title: string;
                timeEstimate: number;
                totalTimeSpent: number;
                assignees: {
                    nodes: {
                        username: string;
                        name: string;
                    }[];
                };
                labels: {
                    nodes: {
                        title: string;
                    }[];
                };
                webUrl: string;
            }[];
        };
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MilestoneView = ({ milestone }: { milestone: Milestone }) => {
    const { data, error, loading } = useQuery<MilestoneIssuesResult>(
        milestoneIssuesQuery,
        {
            variables: {
                milestoneTitle: milestone.title,
            },
            pollInterval: 5000,
            client,
        }
    );

    if (loading) {
        return <Text>Loading...</Text>;
    }

    if (error) {
        return <Text>{error.toString()}</Text>;
    }

    assert(data);

    const {
        project: {
            issues: { nodes },
        },
    } = data;

    const remainingDays = Math.ceil(
        DateTime.fromSQL(milestone.dueDate).diff(
            DateTime.max(
                DateTime.fromSQL(milestone.startDate),
                DateTime.local()
            ),
            'days'
        ).days
    );

    // const totalEstimatedHours = nodes.reduce((a, b) => a + b.timeEstimate, 0) / 3600;

    const assignees: string[] = [];

    for (const issue of nodes) {
        for (const assignee of issue.assignees.nodes) {
            if (!assignees.includes(assignee.username)) {
                assignees.push(assignee.username);
            }
        }
    }

    const timeRemainingByAssignees = assignees.map(assignee => {
        return (
            nodes
                .filter(issue =>
                    issue.assignees.nodes
                        .map(a => a.username)
                        .includes(assignee)
                )
                .filter(item => item.state === 'opened')
                .reduce((a, b) => a + b.timeEstimate, 0) / 3600
        );
    });

    const totalTimeRemaining =
        nodes
            .filter(item => item.state === 'opened')
            .reduce((a, b) => a + b.timeEstimate, 0) / 3600;

    const teamTimeRemaining = timeRemainingByAssignees.length
        ? Math.max(...timeRemainingByAssignees)
        : totalTimeRemaining;

    const teamDaysRemaining = Math.ceil(teamTimeRemaining / 8);

    const closedIssues = nodes.filter(
        item =>
            item.state === 'closed' ||
            item.labels.nodes.map(label => label.title).includes('Review')
    );
    const openIssues = nodes.filter(item => !closedIssues.includes(item));

    return (
        <View>
            <Text>{DateTime.fromSQL(milestone.dueDate).toFormat('d LLL')}</Text>
            <Text openExternalLinks>
                {`<a
                href="https://gitlab.com${milestone.webPath}"
                target="_blank"
            >
                ${milestone.title}
            </a>`}
            </Text>
            <Text openExternalLinks>
                {`
                <div>
                    Time left: ${remainingDays} days
                </div>
                ${
                    teamDaysRemaining > 0
                        ? `<div>Workload remaining: ${teamDaysRemaining} days</div>`
                        : ''
                }
                <div>
                    ${openIssues
                        .map(
                            issue =>
                                `<div>
                                <a
                                    href="${issue.webUrl}"
                                    target="_blank"
                                >
                                    ${issue.title}
                                </a>
                                </div>`
                        )
                        .join('')}
                    ${closedIssues
                        .map(
                            issue =>
                                `
                                <div>
                                <a
                                    href="${issue.webUrl}"
                                    style="text-decoration: line-through"
                                    target="_blank"
                                >
                                    ${issue.title}
                                </a>
                                </div>`
                        )
                        .join('')}
                </div>   
                `}
            </Text>
        </View>
    );
    /*
    return (
        <div className={styles.root}>
            <div className={styles.date}>
                {DateTime.fromSQL(milestone.dueDate).toFormat('d LLL')}
            </div>
            <a
                href={`https://gitlab.com${milestone.webPath}`}
                target="_blank"
                className={styles.title}
            >
                {milestone.title}
            </a>
            <div
                className={clsx(styles.subheading, {
                    [styles.danger]: remainingDays < teamDaysRemaining,
                })}
            >
                Time left: {remainingDays} days
            </div>
            {teamDaysRemaining > 0 && (
                <div
                    className={clsx(styles.subheading, {
                        [styles.danger]: remainingDays < teamDaysRemaining,
                    })}
                >
                    Workload remaining: {teamDaysRemaining} days
                </div>
            )}
            <div className={styles.issues}>
                {nodes
                    .filter(item => item.state === 'opened')
                    .map(issue => (
                        <a
                            href={issue.webUrl}
                            key={issue.id}
                            className={clsx(styles.issue, {
                                [styles.incomplete]: !issue.timeEstimate,
                            })}
                            target="_blank"
                        >
                            {issue.title}
                        </a>
                    ))}
                {nodes
                    .filter(item => item.state === 'closed')
                    .map(issue => (
                        <a
                            href={issue.webUrl}
                            key={issue.id}
                            className={clsx(styles.issue, styles.done)}
                            target="_blank"
                        >
                            {issue.title}
                        </a>
                    ))}
            </div>
        </div>
    );
    */
};

const GitlabReleaseListWidget = () => {
    const { data, error, loading } = useQuery<MilestoneListResult>(
        milestonesQuery,
        {
            variables: {
                fullPath: process.env.GITLAB_RELEASES_GROUP,
            },
            pollInterval: 5000,
            client,
        }
    );

    if (loading) {
        return <Text>Loading...</Text>;
    }

    if (error) {
        return <Text>{error.toString()}</Text>;
    }

    assert(data);

    const {
        project: {
            milestones: { nodes },
        },
    } = data;

    const milestones = nodes
        .slice()
        .filter(a => !!a.startDate)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));

    return (
        <View>
            {milestones.map(milestone => (
                <MilestoneView key={milestone.id} milestone={milestone} />
            ))}
        </View>
    );
};

export default GitlabReleaseListWidget;
