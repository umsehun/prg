use bevy::prelude::*;
use crate::components::{HudMarker};

pub fn spawn_hud_ui(mut commands: Commands) {
    info!("spawn_hud_ui: placeholder");
    commands.spawn((HudMarker, Name::new("HudPlaceholder")));
}
