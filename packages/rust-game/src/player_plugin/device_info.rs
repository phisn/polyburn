use bevy::prelude::*;

#[derive(Resource)]
pub struct DeviceInfo {
    pub is_safari: bool,
}

impl Default for DeviceInfo {
    #[cfg(target_arch = "wasm32")]
    fn default() -> Self {
        let is_safari =
            if let Some(agent) = web_sys::window().and_then(|x| x.navigator().user_agent().ok()) {
                let lower_agent = agent.to_lowercase();

                lower_agent.contains("safari")
                    && !lower_agent.contains("chrome")
                    && !lower_agent.contains("android")
            } else {
                false
            };

        Self { is_safari }
    }

    #[cfg(not(target_arch = "wasm32"))]
    fn default() -> Self {
        Self { is_safari: false }
    }
}
