import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

localStorage.debug = 'ghost-desktop:*';

// Forward log information to the main console
const {ipcRenderer} = requireNode('electron');
const {log} = console;
console.log = (...args) => {
    log(...args);
    ipcRenderer.send('console-message', args);
};

const App = Application.extend({
    modulePrefix: config.modulePrefix,
    podModulePrefix: config.podModulePrefix,
    Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
