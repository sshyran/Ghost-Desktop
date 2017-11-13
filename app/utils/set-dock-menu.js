/**
 * Takes an array of blogs and turns it into a dock menu
 *
 * Expected format
 * items: [{
 *   name: string,
 *   callback: function
 * }];
 *
 * @export
 * @param items - Items to add
 */
export default function setDockMenu(items) {
    const { remote } = requireNode('electron');
    const { app, Menu, MenuItem } = remote;
    const menu = new Menu();

    if (!items || !items.length) {
        return;
    }

    items.forEach((item) => {
        if (!item || !item.name || !item.callback) {
            return;
        }

        menu.append(new MenuItem({
            label: item.name,
            click: item.callback
        }));
    });

    app.dock.setMenu(menu);
}
