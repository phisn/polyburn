mod cart_pole;

// action is always capped between -1 and 1
pub trait Environment {
    fn reset(&self);

    fn step(&self, action: &Vec<f32>) -> f32;
    fn observe(&self) -> (Vec<f32>, bool);

    fn observation_dim(&self) -> usize;
    fn action_dim(&self) -> usize;
}
