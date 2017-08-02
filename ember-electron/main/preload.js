// Preload various modules before actual loading
// the individual Ghost blogs
window.desktop = window.desktop || {};

require('./preload/login');
require('./preload/upgrade-notification');
require('./preload/dragdrop');
require('./preload/spellchecker');
require('./preload/external-links');
require('./preload/devtron');
require('./preload/interactions');