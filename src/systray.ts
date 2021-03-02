import {
    QAction,
    QApplication,
    QIcon,
    QKeySequence,
    QMenu,
    QSystemTrayIcon,
} from '@nodegui/nodegui';
import path from 'path';
// import { Dock } from '@nodegui/os-utils';
import icon from '../assets/check-circle-solid.png';
import activeIcon from '../assets/exclamation-solid.png';

const trayIcon = new QIcon(path.resolve(process.cwd(), icon));
export const activeTrayIcon = new QIcon(
    path.resolve(process.cwd(), activeIcon)
);

export const tray = new QSystemTrayIcon();
tray.setIcon(trayIcon);
tray.show();
tray.setToolTip('Mission Control');

export const activate = () => {
    tray.setIcon(activeTrayIcon);
};

export const deactivate = () => {
    tray.setIcon(trayIcon);
};

const menu = new QMenu();
tray.setContextMenu(menu);

const quitAction = new QAction();
quitAction.setText('Quit');
quitAction.addEventListener('triggered', () => {
    const app = QApplication.instance();
    app.exit(0);
});

export const showAction = new QAction();
showAction.setText('Show window');
showAction.setShortcut(new QKeySequence('Alt+S'));

menu.addAction(showAction);
menu.addAction(quitAction);

// Dock.hide();

const qApp = QApplication.instance();
qApp.setQuitOnLastWindowClosed(false);
