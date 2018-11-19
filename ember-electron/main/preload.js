// Preload various modules before actual loading
// the individual Ghost blogs
window.GhostDesktop = window.GhostDesktop || {};

require('./preload/login');
require('./preload/upgrade-notification');
require('./preload/dragdrop');
require('./preload/external-links');
require('./preload/devtron');
require('./preload/interactions');
require('./preload/night-shift');