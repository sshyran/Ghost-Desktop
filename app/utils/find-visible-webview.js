import Ember from 'ember';

const { $ } = Ember;

export default function findVisibleWebview() {
    const $visibleWebviews = [ ...$('webview:visible') ].filter((i) => $(i).height() > 0);
    const $webview = ($visibleWebviews.length > 0) ? $visibleWebviews[0] : undefined;

    return $webview;
}
