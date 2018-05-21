import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

window.ELECTRON_ENABLE_SECURITY_WARNINGS = true;

setApplication(Application.create(config.APP));

start();
