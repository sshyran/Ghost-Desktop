import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const router = EmberRouter.extend({
    location: config.locationType,
    rootURL: config.rootURL
});

router.map(function () {});

export default router;
