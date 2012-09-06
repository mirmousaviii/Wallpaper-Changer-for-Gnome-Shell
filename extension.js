const Main = imports.ui.main;
const St = imports.gi.St;
const MessageTray = imports.ui.messageTray;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const FileUtils = imports.misc.fileUtils;
const MainLoop = imports.mainloop;

let buttonChangeWallpaper, _timer;

function _myNotify(text)
{
    let source = new MessageTray.SystemNotificationSource();
    Main.messageTray.add(source);
    let notification = new MessageTray.Notification(source, text, null);
    notification.setTransient(true);
    source.notify(notification);
}

function _changeWallpaper() 
{
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
}

function init() 
{
    buttonChangeWallpaper = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: 
                             'view-refresh',
                             icon_type: St.IconType.SYMBOLIC,
                             style_class: 'system-status-icon' });

    buttonChangeWallpaper.set_child(icon);
    buttonChangeWallpaper.connect('button-press-event', _changeWallpaper);
}

function enable() 
{
    Main.panel._rightBox.insert_child_at_index(buttonChangeWallpaper, 0);
    _timer = MainLoop.timeout_add(3600000, Lang.bind(this, _changeWallpaper));
    _changeWallpaper();
}

function disable() 
{
    Main.panel._rightBox.remove_child(buttonChangeWallpaper);
    MainLoop.source_remove(_timer);
}
