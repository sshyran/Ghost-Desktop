import config from './config/environment';
import EmberRouter from '@ember/routing/router';

const router = EmberRouter.extend({
    location: config.locationType,
    rootURL: config.rootURL
});

router.map(function () {});

export default router;
