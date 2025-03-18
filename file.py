import numpy as np
import matplotlib.pyplot as plt
from matplotlib.path import Path
import matplotlib.patches as patches
import imageio.v2 as imageio  # Using v2 explicitly
import os
from matplotlib.transforms import Affine2D

def create_t_shape():
    # Define T shape using vertices
    verts = [
        (0.25, 0.75),  # top-left of horizontal bar
        (0.75, 0.75),  # top-right of horizontal bar
        (0.75, 0.65),  # bottom-right of horizontal bar
        (0.55, 0.65),  # top-right of vertical bar
        (0.55, 0.25),  # bottom-right of vertical bar
        (0.45, 0.25),  # bottom-left of vertical bar
        (0.45, 0.65),  # top-left of vertical bar
        (0.25, 0.65),  # bottom-left of horizontal bar
        (0.25, 0.75),  # back to top-left (close the path)
    ]
    
    codes = [
        Path.MOVETO,
        Path.LINETO,
        Path.LINETO,
        Path.LINETO,
        Path.LINETO,
        Path.LINETO,
        Path.LINETO,
        Path.LINETO,
        Path.CLOSEPOLY,
    ]
    
    return Path(verts, codes)

def generate_rotating_t_gif(output_filename='rotating_green_t.gif', num_frames=120, fps=40):
    # Create temporary directory for frames
    temp_dir = 'temp_frames'
    os.makedirs(temp_dir, exist_ok=True)
    
    # Generate frames
    filenames = []
    # Use negative angles to go counter-clockwise
    angles = np.linspace(0, -360, num_frames, endpoint=False)
    
    for i, angle in enumerate(angles):
        fig, ax = plt.subplots(figsize=(6, 6))
        
        # Create T shape
        t_path = create_t_shape()
        
        # Create rotated path
        transform = Affine2D().rotate_deg_around(0.5, 0.5, angle)
        rotated_path = transform.transform_path(t_path)
        
        # Draw the T
        patch = patches.PathPatch(rotated_path, facecolor='green', edgecolor='darkgreen', linewidth=2)
        ax.add_patch(patch)
        
        # Set limits and aspects
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_aspect('equal')
        ax.axis('off')
        
        # Save the frame
        frame_filename = f'{temp_dir}/frame_{i:03d}.png'
        plt.savefig(frame_filename, bbox_inches='tight', dpi=100)
        plt.close(fig)
        
        filenames.append(frame_filename)
    
    # Create GIF using a specific duration in milliseconds
    duration_ms = int(1000 / fps)  # Convert fps to milliseconds per frame
    
    # Create GIF with explicit duration setting
    with imageio.get_writer(output_filename, mode='I', duration=duration_ms, loop=0) as writer:
        for filename in filenames:
            image = imageio.imread(filename)
            writer.append_data(image)
    
    # Cleanup temporary files
    for filename in filenames:
        os.remove(filename)
    os.rmdir(temp_dir)
    
    print(f"GIF created successfully: {output_filename}")
    print(f"Animation specs: {num_frames} frames at {fps} fps (frame duration: {duration_ms} ms)")
    print(f"Total duration: {num_frames/fps:.2f} seconds")

if __name__ == "__main__":
    # Install required packages if not already installed
    try:
        import matplotlib
        import imageio
    except ImportError:
        import subprocess
        print("Installing required packages...")
        subprocess.check_call(["pip", "install", "matplotlib", "imageio"])
    
    generate_rotating_t_gif()