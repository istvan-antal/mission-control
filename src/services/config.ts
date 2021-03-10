import { resolve } from 'path';
import envPaths from 'env-paths';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

const paths = envPaths('MissionControl', {
    suffix: '',
});

const CONFIG_FILE_PATH = resolve(paths.config, 'settings.json');

console.log(CONFIG_FILE_PATH);

interface GitlabMergeRequestToDoList {
    type: 'GitlabMergeRequestToDoList';
    accessToken: string;
    gitlabGroup: string;
}

interface GitlabReleaseMilestoneList {
    type: 'GitlabReleaseMilestoneList';
    accessToken: string;
    gitlabGroup: string;
}

export type Widget = GitlabMergeRequestToDoList | GitlabReleaseMilestoneList;

let config: {
    widgets: Widget[];
} = { widgets: [] };

const loadConfig = () => {
    try {
        config = JSON.parse(readFileSync(CONFIG_FILE_PATH).toString());
    } catch {
        console.log('No config found');
    }
};

const saveConfig = () => {
    if (!existsSync(paths.config)) {
        mkdirSync(paths.config, { recursive: true });
    }

    writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config));
};

loadConfig();

export const getWidgets = () => config.widgets;

export const addWidget = (widget: Widget) => {
    console.log('addWidget', widget);
    config.widgets.push(widget);
    saveConfig();
};

export const deleteWidget = (index: number) => {
    config.widgets.splice(index, 1);
    saveConfig();
};
