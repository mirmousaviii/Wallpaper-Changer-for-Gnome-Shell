const Main = imports.ui.main;
const St = imports.gi.St;
const MessageTray = imports.ui.messageTray;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const FileUtils = imports.misc.fileUtils;
const MainLoop = imports.mainloop;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;

let _timer;


function _myNotify(text)
{
    let source = new MessageTray.SystemNotificationSource();
    Main.messageTray.add(source);
    let notification = new MessageTray.Notification(source, text, null);
    notification.setTransient(true);
    source.notify(notification);
}

function PopupMenuItem(label, icon, callback) {
    this._init(label, icon, callback);
}

PopupMenuItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function(text, icon, callback) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this);

        this.icon = new St.Icon({ icon_name: icon,
                                  icon_type: St.IconType.FULLCOLOR,
                                  style_class: 'popup-menu-icon' });
        this.addActor(this.icon);
        this.label = new St.Label({ text: text });
        this.addActor(this.label);

        this.connect('activate', callback);
    }
};



function WallpaperChanger() {
    this._init();
}

WallpaperChanger.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,

    _init: function() {
        PanelMenu.SystemStatusButton.prototype._init.call(this, 'preferences-desktop-wallpaper');

        this.change = new PopupMenuItem(_('Change wallpaper'),
                                           'view-refresh',
                                           Lang.bind(this, this._onChange));
        this.menu.addMenuItem(this.change);

    },

    _onChange: function() {
        // Change background
        let settings = new Gio.Settings({ schema: "org.gnome.desktop.background" });    

        let dir_path = "/usr/share/backgrounds/";
        let file = Gio.file_new_for_path(dir_path);
        FileUtils.listDirAsync(file, Lang.bind(this, function(files) {
            let random_num, file_name, file_type;
            
            do
            {
                random_num = Math.floor(Math.random() * 10000000) % files.length; 
                file_name = files[random_num].get_name();
                file_type = file_name.substr( file_name.lastIndexOf(".") ).toLowerCase();
            } while (! (file_type == '.jpg' || file_type == '.jpeg' || file_type == '.png'));
            
            let file_path = "file://" + dir_path + file_name;
            
            settings.set_string("picture-uri", file_path);
        }));

        _myNotify("Wallpaper changed!");

        return true;
    },

};

function init() 
{
    //
}

function enable() 
{
    let _indicator = new WallpaperChanger;
    Main.panel.addToStatusArea('wallpaper_changer', _indicator);
    _timer = MainLoop.timeout_add(3600000, Lang.bind(_indicator, _indicator._onChange));
    _indicator._onChange();
}

function disable() 
{
    _indicator.destroy();
    MainLoop.source_remove(_timer);
}
