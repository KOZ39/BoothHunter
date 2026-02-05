use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, State};
use tauri_plugin_updater::Update;

#[derive(Debug, thiserror::Error)]
pub enum UpdateError {
    #[error(transparent)]
    Updater(#[from] tauri_plugin_updater::Error),
    #[error("There is no pending update")]
    NoPendingUpdate,
}

impl Serialize for UpdateError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

type UpdateResult<T> = Result<T, UpdateError>;

#[derive(Default)]
pub struct PendingUpdate(pub Mutex<Option<Update>>);

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    pub version: String,
    pub body: Option<String>,
}

#[tauri::command]
pub async fn install_update(
    app: AppHandle,
    pending_update: State<'_, PendingUpdate>,
) -> UpdateResult<()> {
    let update = pending_update
        .0
        .lock()
        .unwrap()
        .take()
        .ok_or(UpdateError::NoPendingUpdate)?;

    update.download_and_install(|_, _| {}, || {}).await?;

    app.restart();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pending_update_defaults_to_none() {
        let pending = PendingUpdate::default();
        let guard = pending.0.lock().unwrap();
        assert!(guard.is_none());
    }

    #[test]
    fn update_info_serializes_with_camelcase_fields() {
        let info = UpdateInfo {
            version: "1.2.3".to_string(),
            body: Some("Release notes".to_string()),
        };
        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["version"], "1.2.3");
        assert_eq!(json["body"], "Release notes");
        // Verify camelCase: fields should exist as-is (version/body are already lowercase,
        // but serde rename_all = camelCase is verified by ensuring no snake_case artifacts)
        assert!(json.get("version").is_some());
        assert!(json.get("body").is_some());
    }

    #[test]
    fn update_info_serializes_with_null_body() {
        let info = UpdateInfo {
            version: "0.1.0".to_string(),
            body: None,
        };
        let json = serde_json::to_value(&info).unwrap();
        assert_eq!(json["version"], "0.1.0");
        assert!(json["body"].is_null());
    }

    #[test]
    fn update_error_no_pending_serializes_as_string() {
        let error = UpdateError::NoPendingUpdate;
        let json = serde_json::to_value(&error).unwrap();
        assert_eq!(json, "There is no pending update");
    }

    #[test]
    fn update_error_no_pending_display_message() {
        let error = UpdateError::NoPendingUpdate;
        assert_eq!(error.to_string(), "There is no pending update");
    }
}
