import gymnasium as gym
from gymnasium import spaces
import subprocess
import json
import numpy as np

size = 96

class NodeJsEnvironment(gym.Env):
    metadata = {"render.modes": ["binary"]}

    def __init__(self, script_path):
        super(NodeJsEnvironment, self).__init__()
    
        self.script_path = script_path
        self.prepare_process()

        self.observation_space = spaces.Dict({
            "image": spaces.Box(low=0, high=255, shape=(size, size, 3), dtype=np.uint8),
            "features": spaces.Box(low=-1000, high=1000, shape=(4,), dtype=np.float32)
        })

        self.action_space = spaces.Discrete(6)

    def step(self, action):
        if isinstance(action, np.int32):
            action = action.item()

        command = json.dumps({ "command": "step", "action": action }) + "\n"
        command = command.encode("utf-8")
        self.process.stdin.write(command)
        self.process.stdin.flush()

        if self.process.poll() is not None:
            self.restart_process()
            return self.reset(), 0, True, {}

        data = self.process.stdout.read(size*size*3 + 4*4 + 4 + 1)
        image = np.frombuffer(data[:size*size*3], dtype=np.uint8).reshape(size, size, 3)
        features = np.frombuffer(data[size*size*3:size*size*3+ 4*4], dtype=np.float32)
        reward = np.frombuffer(data[size*size*3 + 4*4:size*size*3 + 4*4 + 4], dtype=np.float32)[0]
        done = data[-1] == 1
        
        return { "image": image, "features": features }, reward, done, {}

    def reset(self):
        if self.process.poll() is not None:
            self.restart_process()

        command = json.dumps({"command": "reset"}) + "\n"
        command = command.encode("utf-8")
        self.process.stdin.write(command)
        self.process.stdin.flush()
        data = self.process.stdout.read(size*size*3 + 4 * 4)
        image = np.frombuffer(data[:size*size*3], dtype=np.uint8).reshape(size, size, 3)
        features = np.frombuffer(data[size*size*3:], dtype=np.float32)

        return { "image": image, "features": features }

    def prepare_process(self):
        self.process = subprocess.Popen(
            self.script_path.split(),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            
            text=False,
            bufsize=0
        )

        # Wait for the initial startup messages to clear.
        self.process.stdout.readline()
        self.process.stdout.readline()
        

    def render(self, mode="binary"):
        self.process.stdin.write(b'{"command":"render"}\n')
        self.process.stdin.flush()
        data = self.process.stdout.read(size*size*3)
        observation = np.frombuffer(data, dtype=np.uint8).reshape(size, size, 3)
        return observation

    def restart_process(self):
        self.close()
        self.prepare_process()

    def close(self):
        if self.process is not None:
            self.process.terminate()
            self.process.wait()

if __name__ == "__main__":
    env = NodeJsEnvironment("yarn tsx ./src/main.ts")
    env.reset()

    import matplotlib.pyplot as plt
    # grid 4 x 4
    fig, axs = plt.subplots(4, 4)
    for i in range(4):
        for j in range(4):
            axs[i, j].imshow(env.render())
            axs[i, j].axis("off")
            o, r, _, _ = env.step(5)
            print(o["features"])

    for i in range(16):
        o, r, _, _ = env.step(0)
        print(o["features"])

    # plt.show()

    env.close()
