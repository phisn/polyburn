import gymnasium as gym
from gymnasium import spaces
import subprocess
import json
import numpy as np

class NodeJsEnvironment(gym.Env):
    metadata = {"render.modes": ["binary"]}

    def __init__(self, script_path):
        super(NodeJsEnvironment, self).__init__()
        self.process = subprocess.Popen(script_path.split(),
                                        stdin=subprocess.PIPE,
                                        stdout=subprocess.PIPE,
                                        stderr=subprocess.PIPE,
                                        text=False,
                                        bufsize=0)
        
        # ignore the first line
        self.process.stdout.readline()
        self.process.stdout.readline()

        self.observation_space = spaces.Box(low=0, high=255, shape=(64, 64, 3), dtype=np.uint8)
        self.action_space = spaces.Discrete(6)

    def step(self, action):
        command = json.dumps({ "command": "step", "action": action.item() }) + "\n"
        command = command.encode("utf-8")
        self.process.stdin.write(command)
        self.process.stdin.flush()

        data = self.process.stdout.read(64*64*3 + 4 + 1)
        observation = np.frombuffer(data[:64*64*3], dtype=np.uint8).reshape(64, 64, 3)
        reward = np.frombuffer(data[64*64*3:64*64*3+4], dtype=np.float32)[0]
        done = data[-1] == 1
        
        return observation, reward, done, {}

    def reset(self):
        command = json.dumps({"command": "reset"}) + "\n"
        command = command.encode("utf-8")
        self.process.stdin.write(command)
        self.process.stdin.flush()
        data = self.process.stdout.read(64*64*3)
        observation = np.frombuffer(data, dtype=np.uint8).reshape(64, 64, 3)
        return observation

    def render(self, mode="binary"):
        command = json.dumps({"command": "render"}) + "\n"
        command = command.encode("utf-8")
        self.process.stdin.write(command)
        self.process.stdin.flush()
        data = self.process.stdout.read(64*64*3)
        return np.frombuffer(data, dtype=np.uint8).reshape(64, 64, 3)

    def close(self):
        self.process.terminate()
        self.process.wait()

class PolyburnEnvironment(NodeJsEnvironment):
    def __init__(self):
        super(PolyburnEnvironment, self).__init__("yarn tsx ./src/main.ts")
        self.observation_space = spaces.Box(low=0, high=255, shape=(64, 64, 3), dtype=np.uint8)
        self.action_space = spaces.Discrete(6)

    def step(self, action):
        observation, reward, done, _ = super(PolyburnEnvironment, self).step(action)
        return observation, reward, done, {}

    def reset(self):
        return super(PolyburnEnvironment, self).reset()

    def render(self, mode="binary"):
        return super(PolyburnEnvironment, self).render()

    def close(self):
        return super(PolyburnEnvironment, self).close()
