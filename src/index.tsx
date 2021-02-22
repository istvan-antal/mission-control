import { Renderer } from '@nodegui/react-nodegui';
import React from 'react';
import { config } from 'dotenv';
import App from './App';

config();

process.title = 'My NodeGui App';
Renderer.render(<App />);
// This is for hot reloading (this will be stripped off in production by webpack)
if (module.hot) {
    module.hot.accept(['./App'], () => {
        Renderer.forceUpdate();
    });
}
