import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const {Application} = Ember;

localStorage.debug = 'ghost-desktop:*';

Ember.MODEL_FACTORY_INJECTIONS = true;

const App = Application.extend({
    modulePrefix: config.modulePrefix,
    podModulePrefix: config.podModulePrefix,
    Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
