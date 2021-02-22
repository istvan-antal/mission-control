import { Text, Window, hot, View } from '@nodegui/react-nodegui';
import React, { useCallback, useEffect, useState } from 'react';
import { QIcon } from '@nodegui/nodegui';
import nodeguiIcon from '../assets/check-circle-solid.png';
import MergeRequestsTodo from './components/MergeRequestsTodo';
import { showAction } from './systray';
import GitlabReleaseListWidget from './components/GitlabReleaseListWidget';

const minSize = { width: 500, height: 520 };
const winIcon = new QIcon(nodeguiIcon);
const App = () => {
    const [visible, setVisible] = useState(false);
    const show = useCallback(() => {
        setVisible(true);
    }, []);
    const hide = useCallback(() => {
        setVisible(false);
    }, []);

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
            <View style={containerStyle}>
                <MergeRequestsTodo />
                <GitlabReleaseListWidget />
            </View>
        </Window>
    );
};

const containerStyle = `
    flex: 1;
    padding-top: 20px;
    padding-horizontal: 20px;
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
`;

export default hot(App);
