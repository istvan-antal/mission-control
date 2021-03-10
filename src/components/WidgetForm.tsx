import { Button, ComboBox, LineEdit, View } from '@nodegui/react-nodegui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import assert from '../assert';
import { Widget } from '../services/config';

const widgetTypes: {
    type: Widget['type'];
    label: string;
}[] = [
    {
        type: 'GitlabMergeRequestToDoList',
        label: 'Gitlab Merge Request ToDo List',
    },
    {
        type: 'GitlabReleaseMilestoneList',
        label: 'Gitlab Release Milestone List',
    },
];

const widgetTypeLabels = widgetTypes.map(type => ({
    text: type.label,
}));

const WidgetForm = ({ onSave }: { onSave: (widget: Widget) => void }) => {
    const currentWidgetType = useRef(widgetTypes[0]);
    const accessToken = useRef('');
    const gitlabGroup = useRef('');

    return (
        <View>
            <ComboBox
                items={widgetTypeLabels}
                on={{
                    currentTextChanged: text => {
                        const widgetType = widgetTypes.find(
                            item => item.label === text
                        );
                        if (!widgetType) {
                            return;
                        }
                        currentWidgetType.current = widgetType;
                    },
                }}
            ></ComboBox>
            <LineEdit
                placeholderText="Personal access token"
                on={{
                    textChanged: text => {
                        accessToken.current = text;
                    },
                }}
            />
            <LineEdit
                placeholderText="Gitlab Group"
                on={{
                    textChanged: text => {
                        gitlabGroup.current = text;
                    },
                }}
            />
            <Button
                on={{
                    pressed: () => {
                        onSave({
                            type: currentWidgetType.current.type,
                            accessToken: accessToken.current,
                            gitlabGroup: gitlabGroup.current,
                        });
                    },
                }}
            >
                Add
            </Button>
        </View>
    );
};

export default WidgetForm;
