use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

/// Bundled app index – used for the reset navigation.
/// In dev Vite serves on localhost:1420; in production Tauri uses its own scheme.
#[cfg(debug_assertions)]
const APP_INDEX: &str = "http://localhost:1420/index.html?reset=1";
#[cfg(not(debug_assertions))]
const APP_INDEX: &str = "tauri://localhost/index.html?reset=1";

/// Shows, unminimizes and focuses the main window.
fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

pub fn run() {
    tauri::Builder::default()
        // ── Single-instance guard ────────────────────────────────────────────
        // When a second instance is launched (e.g. double-clicking the icon
        // while the app is already in the tray), we just bring the existing
        // window to the foreground instead of opening a new one.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main_window(app);
        }))
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let quit_i  = MenuItem::with_id(app, "quit",  "Quit",      true, None::<&str>)?;
            let show_i  = MenuItem::with_id(app, "show",  "Show",      true, None::<&str>)?;
            let reset_i = MenuItem::with_id(app, "reset", "Reset URL", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&show_i, &reset_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app_handle, event| match event.id.as_ref() {
                    "quit" => {
                        app_handle.exit(0);
                    }
                    "show" => {
                        show_main_window(app_handle);
                    }
                    "reset" => {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            // The window may currently be showing an external HA URL
                            // (e.g. http://192.168.1.100:8123). We cannot use
                            // window.location.origin there because that would point
                            // to the HA server, not to the bundled app.
                            //
                            // Instead we navigate directly to the known app URL and
                            // clear localStorage first so the auto-redirect in
                            // main.ts does not kick in immediately.
                            let script = format!(
                                r#"(function(){{
                                    try{{ localStorage.removeItem('ha_url'); }}catch(_){{}}
                                    window.location.replace('{}');
                                }})();"#,
                                APP_INDEX
                            );
                            let _ = window.eval(&script);
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray_handle, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main_window(tray_handle.app_handle());
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            // Hide instead of close so the app stays alive in the tray
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}