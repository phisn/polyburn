import numpy as np
import sys
import os

# list all folders in the path
path = "./packages/learning-gym/dreamerv3/logdir/polyburn-1/replay"

filenames = os.listdir(path)
files = [np.load(os.path.join(path, filename)) for filename in filenames]

best = 0
best_image = None

for file in files:
    is_last = file["is_last"]

    images = np.split(file["image"], np.where(is_last)[0] + 1)
    rewards = np.split(file["reward"], np.where(is_last)[0] + 1)
    rewards = [np.sum(reward) for reward in rewards]

    best_in_rewards = np.argmax(rewards)

    if rewards[best_in_rewards] > best:
        best = rewards[best_in_rewards]
        best_image = images[best_in_rewards]


print("Found with reward:", best)

# best_image contains numpy array of pixels rgb
# convert to gif. should loop infinitely
import imageio
imageio.mimsave("best.gif", best_image, duration=0.1, loop=0)
