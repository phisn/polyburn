import matplotlib.pyplot as plt
import matplotlib.patches as patches
import re

# Sample input data (trimmed for demonstration; replace with the actual input)
data_str = """Node(Split { split_type: Vertical, min: 43.395508, max: 116.14551 }, Node(Split { split_type: Vertical, min: 26.82129, max: 68.081055 }, Leaf([Aabb { mins: [-32.129883, 11.299805], maxs: [-23.99707, 36.59668] }, Aabb { mins: [-30.615234, 11.300781], maxs: [-1.1464844, 35.109375] }, Aabb { mins: [-11.15332, 11.301758], maxs: [-1.1464844, 37.410156] }, Aabb { mins: [-6.4697266, 35.112305], maxs: [-1.0498047, 48.69922] }, Aabb { mins: [-1.3515625, 6.993164], maxs: [25.370117, 38.499023] }, Aabb { mins: [6.598633, 46.549805], maxs: [12.238281, 49.739258] }, Aabb { mins: [4.9990234, 34.510742], maxs: [12.238281, 46.620117] }, Aabb { mins: [10.538086, 22.279297], maxs: [25.370117, 36.029297] }, Aabb { mins: [14.422852, -7.107422], maxs: [32.229492, 22.279297] }, Aabb { mins: [3.5498047, 38.499023], maxs: [6.598633, 49.069336] }, Aabb { mins: [14.549805, 29.59961], maxs: [30.12793, 36.029297] }]), Leaf([Aabb { mins: [42.57715, 23.639648], maxs: [54.8584, 38.38965] }, Aabb { mins: [55.90918, -16.06836], maxs: [68.081055, -12.330078] }, Aabb { mins: [42.57715, 17.398438], maxs: [51.83496, 27.609375] }, Aabb { mins: [51.83496, 27.609375], maxs: [74.46777, 38.788086] }, Aabb { mins: [69.006836, 31.331055], maxs: [77.38965, 38.788086] }, Aabb { mins: [47.338867, 5.149414], maxs: [56.62793, 17.399414] }, Aabb { mins: [55.90918, -14.728516], maxs: [61.88965, 0.61816406] }, Aabb { mins: [58.658203, 6.4882813], maxs: [67.700195, 12.15918] }, Aabb { mins: [61.289063, 5.3984375], maxs: [67.700195, 7.7695313] }, Aabb { mins: [67.2207, 3.3886719], maxs: [84.75, 22.749023] }, Aabb { mins: [65.03906, 12.15918], maxs: [76.12891, 23.280273] }, Aabb { mins: [73.11914, -6.6083984], maxs: [75.79004, 3.8095703] }, Aabb { mins: [73.11914, -6.6083984], maxs: [77.34961, -1.4082031] }, Aabb { mins: [82.668945, -1.6005859], maxs: [88.51172, 5.4414063] }]), Leaf([Aabb { mins: [26.82129, -15.115234], maxs: [56.698242, 23.639648] }, Aabb { mins: [29.358398, 17.970703], maxs: [42.57715, 23.88086] }, Aabb { mins: [38.32129, -35.708984], maxs: [68.081055, -14.728516] }])), Node(Split { split_type: Horizontal, min: -34.249023, max: 33.719727 }, Leaf([Aabb { mins: [90.37988, -12.46875], maxs: [95.50879, -4.0410156] }, Aabb { mins: [95.50879, -35.0791], maxs: [116.14551, -12.46875] }, Aabb { mins: [101.36035, -7.989258], maxs: [107.819336, -3.1103516] }, Aabb { mins: [102.399414, -35.0791], maxs: [160.73926, -4.9101563] }, Aabb { mins: [109.37988, 0.42871094], maxs: [127.87793, 22.29004] }, Aabb { mins: [93.67871, -7.609375], maxs: [95.45996, -4.0410156] }, Aabb { mins: [94.77051, -7.609375], maxs: [97.52051, -5.189453] }, Aabb { mins: [106.4209, 9.7890625], maxs: [111.200195, 16.418945] }, Aabb { mins: [109.22949, 16.418945], maxs: [117.850586, 20.169922] }, Aabb { mins: [110.74902, 9.7890625], maxs: [117.850586, 20.169922] }, Aabb { mins: [107.0, 4.428711], maxs: [108.21973, 10.119141] }, Aabb { mins: [107.21973, 2.5185547], maxs: [110.74902, 9.7890625] }, Aabb { mins: [108.049805, 18.569336], maxs: [112.08887, 20.67871] }, Aabb { mins: [98.76953, 4.939453], maxs: [103.65918, 13.066406] }, Aabb { mins: [98.76953, 3.9296875], maxs: [104.57031, 6.588867] }]), Node(Split { split_type: Vertical, min: 103.4834, max: 170.7334 }, Leaf([Aabb { mins: [128.38965, 28.59082], maxs: [133.63867, 44.01953] }, Aabb { mins: [101.17969, 39.58008], maxs: [106.62109, 44.021484] }, Aabb { mins: [105.518555, 39.0], maxs: [114.32031, 43.55957] }, Aabb { mins: [110.22949, 36.259766], maxs: [120.50781, 43.229492] }, Aabb { mins: [118.03906, 37.223633], maxs: [133.63867, 48.839844] }, Aabb { mins: [118.163086, 37.223633], maxs: [128.38965, 43.229492] }, Aabb { mins: [99.87012, 50.189453], maxs: [115.90527, 66.24902] }, Aabb { mins: [107.38965, 47.609375], maxs: [114.79004, 54.679688] }, Aabb { mins: [98.18848, 27.429688], maxs: [110.30957, 34.859375] }]), Leaf([Aabb { mins: [169.23926, 31.125], maxs: [182.05176, 45.799805] }, Aabb { mins: [168.03027, 40.80957], maxs: [171.79004, 46.411133] }, Aabb { mins: [135.71777, 46.15625], maxs: [163.55762, 60.359375] }, Aabb { mins: [141.12012, 37.910156], maxs: [161.0498, 48.021484] }, Aabb { mins: [154.01074, 39.90039], maxs: [161.0498, 46.15625] }, Aabb { mins: [135.71777, 55.46875], maxs: [170.7334, 66.17969] }, Aabb { mins: [142.02832, 31.089844], maxs: [149.05762, 39.820313] }, Aabb { mins: [159.28027, 36.070313], maxs: [164.13965, 46.15625] }]), Leaf([Aabb { mins: [131.46094, 44.01953], maxs: [136.91797, 48.839844] }, Aabb { mins: [103.4834, 59.19922], maxs: [170.7334, 66.24902] }])), Leaf([Aabb { mins: [110.05957, -34.249023], maxs: [160.73926, 25.149414] }, Aabb { mins: [127.87793, 22.29004], maxs: [138.71973, 32.933594] }, Aabb { mins: [127.87793, 22.29004], maxs: [147.61816, 26.980469] }, Aabb { mins: [159.44629, -34.249023], maxs: [182.05176, 33.719727] }, Aabb { mins: [104.34082, 21.160156], maxs: [106.3291, 27.429688] }])), Leaf([Aabb { mins: [43.395508, -35.708984], maxs: [116.14551, -16.0] }, Aabb { mins: [79.84668, -16.0], maxs: [90.37988, -6.529297] }, Aabb { mins: [79.84668, -35.0791], maxs: [116.14551, -10.708984] }, Aabb { mins: [82.668945, 1.0097656], maxs: [104.359375, 34.13867] }, Aabb { mins: [84.38965, 21.249023], maxs: [98.18848, 57.776367] }, Aabb { mins: [86.069336, 42.779297], maxs: [100.24902, 64.99902] }]))"""

# Function to parse the input data into a structured tree
def parse_data(data_str):
    # Simplify parsing by replacing types with easily identifiable markers
    data_str = data_str.replace('Node(Split {', 'SPLIT(').replace('Leaf([', 'LEAF(').replace('Aabb {', 'AABB(')
    data_str = data_str.replace('}', ')').replace(']', ')')
    
    # A recursive function to parse nested structures
    def parse_node(sub_str):
        if sub_str.startswith('SPLIT'):
            parts = re.match(r"SPLIT\( split_type: (\w+), min: ([\d.]+), max: ([\d.]+) \), (.*)", sub_str)
            split_type, min_val, max_val, rest = parts.groups()
            min_val, max_val = float(min_val), float(max_val)
            left_str, right_str = split_branches(rest)
            return {'type': 'split', 'split_type': split_type, 'min': min_val, 'max': max_val, 
                    'left': parse_node(left_str), 'right': parse_node(right_str)}
        elif sub_str.startswith('LEAF'):
            aabbs = re.findall(r"AABB\( mins: \[([\d.-]+), ([\d.-]+)\], maxs: \[([\d.-]+), ([\d.-]+)\] \)", sub_str)
            aabbs = [{'mins': [float(aabbs[i][0]), float(aabbs[i][1])], 
                      'maxs': [float(aabbs[i][2]), float(aabbs[i][3])]} for i in range(len(aabbs))]
            return {'type': 'leaf', 'aabbs': aabbs}
    
    def split_branches(rest):
        count, i = 0, 0
        for char in rest:
            if char == '(':
                count += 1
            elif char == ')':
                count -= 1
            if count == 0:
                break
            i += 1
        return rest[1:i+1], rest[i+3:-1]
    
    return parse_node(data_str)

# Function to visualize the tree and AABBs
def visualize_tree(tree):
    fig, ax = plt.subplots()
    ax.set_xlim(-50, 200)
    ax.set_ylim(-50, 70)
    
    # Recursive function to draw the splits and AABBs
    def draw_node(node, x_range=(-50, 200), y_range=(-50, 70)):
        if node['type'] == 'split':
            if node['split_type'] == 'Vertical':
                plt.plot([node['min'], node['min']], y_range, 'r-')
                draw_node(node['left'], (x_range[0], node['min']), y_range)
                draw_node(node['right'], (node['min'], x_range[1]), y_range)
            elif node['split_type'] == 'Horizontal':
                plt.plot(x_range, [node['min'], node['min']], 'r-')
                draw_node(node['left'], x_range, (y_range[0], node['min']))
                draw_node(node['right'], x_range, (node['min'], y_range[1]))
        elif node['type'] == 'leaf':
            for aabb in node['aabbs']:
                rect = patches.Rectangle((aabb['mins'][0], aabb['mins'][1]), aabb['maxs'][0] - aabb['mins'][0], aabb['maxs'][1] - aabb['mins'][1], linewidth=1, edgecolor='b', facecolor='none')
                ax.add_patch(rect)

    # Draw the parsed tree structure
    draw_node(tree)

    plt.show()

visualize_tree(parse_data(data_str))


