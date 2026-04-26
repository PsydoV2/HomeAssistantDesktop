use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[cfg(debug_assertions)]
const APP_INDEX: &str = "http://localhost:1420/index.html";
#[cfg(not(debug_assertions))]
const APP_INDEX: &str = "tauri://localhost/index.html";

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

/// Rebuilds the tray menu, refreshing the autostart label to reflect current state.
fn rebuild_tray_menu(app: &tauri::AppHandle) -> tauri::Result<()> {
    let is_enabled = app.autolaunch().is_enabled().unwrap_or(false);
    let autostart_label = if is_enabled {
        "Disable Autostart"
    } else {
        "Enable Autostart"
    };

    let show_i      = MenuItem::with_id(app, "show",      "Show",            true, None::<&str>)?;
    let switch_i    = MenuItem::with_id(app, "switch",    "Switch Instance", true, None::<&str>)?;
    let autostart_i = MenuItem::with_id(app, "autostart", autostart_label,   true, None::<&str>)?;
    let quit_i      = MenuItem::with_id(app, "quit",      "Quit",            true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_i, &switch_i, &autostart_i, &quit_i])?;

    if let Some(tray) = app.tray_by_id("main_tray") {
        tray.set_menu(Some(menu))?;
    }

    Ok(())
}

#[tauri::command]
fn set_zoom(window: tauri::WebviewWindow, factor: f64) -> Result<(), String> {
    let clamped = factor.clamp(0.5, 3.0);
    window.set_zoom(clamped).map_err(|e| e.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main_window(app);
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        show_main_window(app);
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![set_zoom])
        .setup(|app| {
            // Register Ctrl+Shift+H to show/focus the window from anywhere
            app.global_shortcut().register(Shortcut::new(
                Some(Modifiers::CONTROL | Modifiers::SHIFT),
                Code::KeyH,
            ))?;

            let is_enabled = app.autolaunch().is_enabled().unwrap_or(false);
            let autostart_label = if is_enabled {
                "Disable Autostart"
            } else {
                "Enable Autostart"
            };

            let show_i      = MenuItem::with_id(app, "show",      "Show",            true, None::<&str>)?;
            let switch_i    = MenuItem::with_id(app, "switch",    "Switch Instance", true, None::<&str>)?;
            let autostart_i = MenuItem::with_id(app, "autostart", autostart_label,   true, None::<&str>)?;
            let quit_i      = MenuItem::with_id(app, "quit",      "Quit",            true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&show_i, &switch_i, &autostart_i, &quit_i])?;

            TrayIconBuilder::with_id("main_tray")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app_handle, event| match event.id.as_ref() {
                    "quit" => app_handle.exit(0),
                    "show" => show_main_window(app_handle),
                    "switch" => {
                        // We cannot clear ha_url via eval here: the webview is currently
                        // showing the HA page (external origin), so window.localStorage
                        // belongs to HA, not to our app. Instead, navigate with ?switch=1
                        // and let the frontend clear the key from the correct origin.
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.eval(&format!(
                                "window.location.replace('{APP_INDEX}?switch=1')"
                            ));
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "autostart" => {
                        let mgr = app_handle.autolaunch();
                        if mgr.is_enabled().unwrap_or(false) {
                            let _ = mgr.disable();
                        } else {
                            let _ = mgr.enable();
                        }
                        let _ = rebuild_tray_menu(app_handle);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main_window(tray.app_handle());
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
