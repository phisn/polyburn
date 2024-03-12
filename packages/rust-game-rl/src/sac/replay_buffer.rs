use burn::tensor::{backend::Backend, Data, Shape, Tensor};
use rand::{seq::SliceRandom, Rng};

#[derive(Clone)]
pub struct Experience<B: Backend> {
    observation: Vec<B::FloatElem>,
    action: Vec<B::FloatElem>,
    next_observation: Vec<B::FloatElem>,

    reward: B::FloatElem,
    done: B::FloatElem,
}

pub struct ExperienceBatch<B: Backend> {
    pub observation: Tensor<B, 2>,
    pub action: Tensor<B, 2>,
    pub next_observation: Tensor<B, 2>,

    pub reward: Tensor<B, 1>,
    pub done: Tensor<B, 1>,
}

pub struct ReplayBuffer<B: Backend> {
    buffer: Vec<Experience<B>>,

    capacity: usize,
    ptr: usize,
    size: usize,
}

impl<B: Backend> ReplayBuffer<B> {
    pub fn new(capacity: usize) -> Self {
        Self {
            buffer: Vec::with_capacity(capacity),
            capacity,
            ptr: 0,
            size: 0,
        }
    }

    pub fn store(&mut self, experience: Experience<B>) {
        if self.size < self.capacity {
            self.buffer.push(experience);
            self.size += 1;
        } else {
            self.buffer[self.ptr] = experience;
            self.ptr = (self.ptr + 1) % self.capacity;
        }
    }

    pub fn sample_batch(&self, batch_size: usize, device: &B::Device) -> ExperienceBatch<B> {
        // -> Vec<&Experience<Observation, Action>> {
        let mut rng = rand::thread_rng();

        let indices: Vec<usize> = (0..batch_size)
            .map(|_| rng.gen_range(0..self.size))
            .collect();

        let sample_tensor_1d = |f: fn(&Experience<B>) -> B::FloatElem| {
            let elements = indices
                .iter()
                .map(|&i| f(&self.buffer[i]))
                .collect::<Vec<B::FloatElem>>();

            Tensor::<B, 1>::from_data(Data::new(elements, [batch_size].into()), device)
        };

        let sample_tensor_2d = |f: fn(&Experience<B>) -> &Vec<B::FloatElem>| {
            let mut elements = Vec::with_capacity(batch_size * self.buffer[0].observation.len());

            for &i in &indices {
                for &e in f(&self.buffer[i]) {
                    elements.push(e);
                }
            }

            Tensor::<B, 2>::from_data(
                Data::new(
                    elements,
                    [batch_size, self.buffer[0].observation.len()].into(),
                ),
                device,
            )
        };

        let observation = sample_tensor_2d(|e| &e.observation);
        let action = sample_tensor_2d(|e| &e.action);
        let next_observation = sample_tensor_2d(|e| &e.next_observation);
        let reward = sample_tensor_1d(|e| e.reward);
        let done = sample_tensor_1d(|e| e.done);

        ExperienceBatch {
            observation,
            action,
            next_observation,
            reward,
            done,
        }
    }
}
