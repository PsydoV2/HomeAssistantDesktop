use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let reset_i = MenuItem::with_id(app, "reset", "Reset URL", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&show_i, &reset_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app_handle, event| {
                    if event.id.as_ref() == "quit" {
                        app_handle.exit(0);
                    } else if event.id.as_ref() == "show" {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    } else if event.id.as_ref() == "reset" {
    if let Some(window) = app_handle.get_webview_window("main") {
        // Wir nutzen die absolute URL deines lokalen Frontends
        // In der Produktion (Release) nutzt Tauri tauri://localhost oder ipc://
        // Dieser Befehl funktioniert für Dev und Release:
        let _ = window.eval("
            localStorage.clear();
            window.location.href = window.location.origin + '/index.html?reset=1';
            
            // Falls das fehlschlägt (weil wir auf einer fremden Domain sind), 
            // erzwingen wir den harten Reload zur internen Startseite:
            if (!window.location.href.includes('localhost') && !window.location.href.includes('tauri')) {
                 window.location.href = 'http://localhost:1420/index.html?reset=1';
            }
        ");
        let _ = window.show();
        let _ = window.set_focus();
    }
}
                })
                .on_tray_icon_event(|tray_handle, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app_handle = tray_handle.app_handle();
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                let _ = window.hide();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}