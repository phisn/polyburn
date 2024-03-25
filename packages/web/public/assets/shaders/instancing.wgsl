#import bevy_sprite::{mesh2d_functions as mesh_functions}

struct Vertex {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,

    @location(3) i_pos_scale: vec4<f32>,
    @location(4) i_color: vec4<f32>,
};

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) color: vec4<f32>,
}

const identity_matrix: mat4x4<f32> = mat4x4<f32>(
    vec4<f32>(1.0, 0.0, 0.0, 0.0),
    vec4<f32>(0.0, 1.0, 0.0, 0.0),
    vec4<f32>(0.0, 0.0, 1.0, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 1.0)
);

@vertex
fn vertex(vertex: Vertex) -> VertexOutput {
    let position = vertex.position * vertex.i_pos_scale.w + vertex.i_pos_scale.xyz;
    var out: VertexOutput;
    
    out.clip_position = mesh_functions::mesh2d_position_local_to_clip(
        // identity_matrix approach found here (https://github.com/jadedbay/bevy_procedural_grass/blob/c1269a964fd9ee31c2569a580535ee6b61cfcf03/src/assets/shaders/grass.wgsl)
        // i do not understand why this works or why other soultions suggested in the bevy discord do not work.
        identity_matrix,
        vec4<f32>(position, 1.0)
    );
    out.color = vertex.i_color;
    
    return out;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    return in.color;
}
