use bevy::prelude::*;

#[derive(Clone)]
pub struct Gradient {
    entries: Vec<GradientEntry>,
}

impl Default for Gradient {
    fn default() -> Self {
        Self {
            entries: vec![GradientEntry {
                time: 0.0,
                color: Color::WHITE,
            }],
        }
    }
}

#[derive(Clone, Copy)]
pub struct GradientEntry {
    pub time: f32,
    pub color: Color,
}

impl Gradient {
    pub const fn new(entries: Vec<GradientEntry>) -> Self {
        Self { entries }
    }

    pub fn pick_color(&self, time: f32) -> Color {
        if self.entries.len() == 1 {
            return self.entries[0].color;
        }

        if time <= self.entries[0].time {
            return self.entries[0].color;
        }

        for i in 0..self.entries.len() - 1 {
            if time >= self.entries[i].time && time <= self.entries[i + 1].time {
                let ratio = (time - self.entries[i].time)
                    / (self.entries[i + 1].time - self.entries[i].time);

                let left = self.entries[i].color;
                let right = self.entries[i + 1].color;

                return left + (right + left * -1.0) * ratio;
            }
        }

        self.entries[self.entries.len() - 1].color
    }
}
