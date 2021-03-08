import {
    Text,
    Window,
    hot,
    View,
    ScrollArea,
    Button,
    ComboBox,
    LineEdit,
} from '@nodegui/react-nodegui';
import React, { useCallback, useEffect, useState } from 'react';
import { QIcon } from '@nodegui/nodegui';
import nodeguiIcon from '../assets/check-circle-solid.png';
import MergeRequestsTodo from './components/MergeRequestsTodo';
import { showAction } from './systray';
import GitlabReleaseListWidget from './components/GitlabReleaseListWidget';
import { addWidget, getWidgets, Widget } from './services/config';
import WidgetForm from './components/WidgetForm';

const minSize = { width: 500, height: 520 };
const winIcon = new QIcon(nodeguiIcon);

const App = () => {
    const [visible, setVisible] = useState(true);
    const show = useCallback(() => {
        setVisible(true);
    }, []);
    const hide = useCallback(() => {
        setVisible(false);
    }, []);
    const [widgets, setWidgets] = useState<Widget[]>(getWidgets());

    useEffect(() => {
        showAction.addEventListener('triggered', show);
        return () => {
            showAction.removeEventListener('triggered', show);
        };
    });

    return (
        <Window
            visible={visible}
            windowIcon={winIcon}
            windowTitle="Mission Control"
            minSize={minSize}
            styleSheet={styleSheet}
            on={{
                Close: hide,
            }}
        >
            <ScrollArea>
                <View id="app" style={containerStyle}>
                    {widgets.map((widget, index) => {
                        switch (widget.type) {
                            case 'GitlabMergeRequestToDoList':
                                return (
                                    <MergeRequestsTodo
                                        key={index}
                                        accessToken={widget.accessToken}
                                        gitlabGroup={widget.gitlabGroup}
                                    />
                                );
                            case 'GitlabReleaseMilestoneList':
                                return (
                                    <GitlabReleaseListWidget
                                        key={index}
                                        accessToken={widget.accessToken}
                                        gitlabGroup={widget.gitlabGroup}
                                    />
                                );
                            default:
                                throw new Error('Invalid widget type');
                        }
                    })}
                    <WidgetForm
                        onSave={widget => {
                            addWidget(widget);
                            setWidgets([...getWidgets()]);
                        }}
                    />
                </View>
            </ScrollArea>
        </Window>
    );
};

const containerStyle = `
    flex: 1;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
`;

const styleSheet = `
    #welcome-text {
        font-size: 24px;
        padding-top: 20px;
        qproperty-alignment: 'AlignHCenter';
        font-family: 'sans-serif';
    }
    #step-1, #step-2 {
        font-size: 18px;
        padding-top: 10px;
        padding-horizontal: 20px;
    }

    #app {
        background-color: #FFF;
    }
`;

export default hot(App);
