use bevy::{
    core_pipeline::core_2d::Transparent2d,
    ecs::{
        query::QueryItem,
        system::{lifetimeless::*, SystemParamItem},
    },
    pbr::MeshUniform,
    prelude::*,
    render::{
        batching::NoAutomaticBatching,
        extract_component::{ExtractComponent, ExtractComponentPlugin},
        mesh::{GpuBufferInfo, MeshVertexBufferLayout},
        render_asset::RenderAssets,
        render_phase::{
            AddRenderCommand, DrawFunctions, PhaseItem, RenderCommand, RenderCommandResult,
            RenderPhase, SetItemPipeline, TrackedRenderPass,
        },
        render_resource::*,
        renderer::RenderDevice,
        view::{ExtractedView, NoFrustumCulling},
        Render, RenderApp, RenderSet,
    },
    sprite::{
        MaterialMesh2dBundle, Mesh2d, Mesh2dHandle, Mesh2dPipeline, Mesh2dPipelineKey,
        Mesh2dUniform, RenderMesh2dInstances, SetMesh2dBindGroup, SetMesh2dViewBindGroup,
    },
    utils::FloatOrd,
};
use bytemuck::{Pod, Zeroable};

#[derive(Component, Default, ExtractComponent, Clone)]
pub struct InstancingHost {
    buffer: Vec<InstanceData>,
}

#[derive(Component, Clone)]
pub struct InstancingChild {
    pub color: [f32; 4],
    pub scale: f32,
}

pub struct InstancingPlugin;

impl Plugin for InstancingPlugin {
    fn build(&self, app: &mut App) {
        app.add_plugins(ExtractComponentPlugin::<InstancingHost>::default());
        app.add_systems(PostUpdate, prepare_buffer);

        app.sub_app_mut(RenderApp)
            .add_render_command::<Transparent2d, DrawCustom>()
            .init_resource::<SpecializedMeshPipelines<CustomPipeline>>()
            .add_systems(
                Render,
                (
                    queue_custom.in_set(RenderSet::Queue),
                    prepare_instance_buffers.in_set(RenderSet::Prepare),
                ),
            );
    }

    fn finish(&self, app: &mut App) {
        app.sub_app_mut(RenderApp).init_resource::<CustomPipeline>();
    }
}

fn prepare_buffer(
    mut instanced_materials: Query<(&mut InstancingHost, Option<&Children>)>,
    instanced_material_children: Query<(&InstancingChild, &Transform)>,
) {
    for (mut instanced_material, children) in &mut instanced_materials {
        instanced_material.buffer.clear();

        if let Some(children) = children {
            let children = children
                .iter()
                .map(|entity| instanced_material_children.get(*entity).unwrap());

            for (child, child_transform) in children {
                instanced_material.buffer.push(InstanceData {
                    position: child_transform.translation,
                    scale: child.scale,
                    color: child.color,
                });
            }
        }
    }
}

#[derive(Clone, Copy, Pod, Zeroable)]
#[repr(C)]
struct InstanceData {
    position: Vec3,
    scale: f32,
    color: [f32; 4],
}

#[allow(clippy::too_many_arguments)]
fn queue_custom(
    transparent_2d_draw_functions: Res<DrawFunctions<Transparent2d>>,
    custom_pipeline: Res<CustomPipeline>,
    msaa: Res<Msaa>,
    mut pipelines: ResMut<SpecializedMeshPipelines<CustomPipeline>>,
    pipeline_cache: Res<PipelineCache>,
    meshes: Res<RenderAssets<Mesh>>,
    render_mesh_instances: Res<RenderMesh2dInstances>,
    material_meshes: Query<Entity, With<InstancingHost>>,
    mut views: Query<(&ExtractedView, &mut RenderPhase<Transparent2d>)>,
) {
    let draw_custom = transparent_2d_draw_functions.read().id::<DrawCustom>();
    let msaa_key = Mesh2dPipelineKey::from_msaa_samples(msaa.samples());

    for (view, mut transparent_phase) in &mut views {
        let view_key = msaa_key | Mesh2dPipelineKey::from_hdr(view.hdr);
        for entity in &material_meshes {
            let Some(mesh_instance) = render_mesh_instances.get(&entity) else {
                error!("Mesh instance not found for entity {:?}", entity);
                continue;
            };

            let Some(mesh) = meshes.get(mesh_instance.mesh_asset_id) else {
                error!("Mesh not found for entity {:?}", entity);
                continue;
            };

            let key =
                view_key | Mesh2dPipelineKey::from_primitive_topology(mesh.primitive_topology);

            let pipeline =
                pipelines.specialize(&pipeline_cache, &custom_pipeline, key, &mesh.layout);

            let pipeline = match pipeline {
                Ok(id) => id,
                Err(err) => {
                    error!("Failed to create pipeline: {:?}", err);
                    continue;
                }
            };

            let mesh_z = mesh_instance.transforms.transform.translation.z;

            transparent_phase.add(Transparent2d {
                sort_key: FloatOrd(mesh_z),
                entity: entity,
                pipeline,
                draw_function: draw_custom,
                batch_range: 0..1,
                dynamic_offset: None,
            });
        }
    }
}

#[derive(Component)]
pub struct InstanceBuffer {
    buffer: Buffer,
    length: usize,
}

fn prepare_instance_buffers(
    mut commands: Commands,
    query: Query<(Entity, &InstancingHost)>,
    render_device: Res<RenderDevice>,
) {
    for (entity, instances) in &query {
        let buffer = render_device.create_buffer_with_data(&BufferInitDescriptor {
            label: Some("instance data buffer"),
            contents: bytemuck::cast_slice(instances.buffer.as_slice()),
            usage: BufferUsages::VERTEX | BufferUsages::COPY_DST,
        });

        commands.entity(entity).insert(InstanceBuffer {
            buffer,
            length: instances.buffer.len(),
        });
    }
}

#[derive(Resource)]
pub struct CustomPipeline {
    shader: Handle<Shader>,
    mesh_pipeline: Mesh2dPipeline,
}

impl FromWorld for CustomPipeline {
    fn from_world(world: &mut World) -> Self {
        let asset_server = world.resource::<AssetServer>();
        let shader = asset_server.load("shaders/instancing.wgsl");

        let mesh_pipeline = world.resource::<Mesh2dPipeline>();

        CustomPipeline {
            shader,
            mesh_pipeline: mesh_pipeline.clone(),
        }
    }
}

impl SpecializedMeshPipeline for CustomPipeline {
    type Key = Mesh2dPipelineKey;

    fn specialize(
        &self,
        key: Self::Key,
        layout: &MeshVertexBufferLayout,
    ) -> Result<RenderPipelineDescriptor, SpecializedMeshPipelineError> {
        let mut descriptor = self.mesh_pipeline.specialize(key, layout)?;

        // meshes typically live in bind group 2. because we are using bindgroup 1
        // we need to add MESH_BINDGROUP_1 shader def so that the bindings are correctly
        // linked in the shader
        descriptor
            .vertex
            .shader_defs
            .push("MESH_BINDGROUP_1".into());

        descriptor.vertex.shader = self.shader.clone();
        descriptor.vertex.buffers.push(VertexBufferLayout {
            array_stride: std::mem::size_of::<InstanceData>() as u64,
            step_mode: VertexStepMode::Instance,
            attributes: vec![
                VertexAttribute {
                    format: VertexFormat::Float32x4,
                    offset: 0,
                    shader_location: 3, // shader locations 0-2 are taken up by Position, Normal and UV attributes
                },
                VertexAttribute {
                    format: VertexFormat::Float32x4,
                    offset: VertexFormat::Float32x4.size(),
                    shader_location: 4,
                },
                VertexAttribute {
                    format: VertexFormat::Uint32,
                    offset: VertexFormat::Float32x4.size() * 2,
                    shader_location: 5,
                },
            ],
        });
        descriptor.fragment.as_mut().unwrap().shader = self.shader.clone();
        Ok(descriptor)
    }
}

type DrawCustom = (
    SetItemPipeline,
    SetMesh2dViewBindGroup<0>,
    SetMesh2dBindGroup<1>,
    DrawMeshInstanced,
);

pub struct DrawMeshInstanced;

impl<P: PhaseItem> RenderCommand<P> for DrawMeshInstanced {
    type Param = (SRes<RenderAssets<Mesh>>, SRes<RenderMesh2dInstances>);
    type ViewQuery = ();
    type ItemQuery = Read<InstanceBuffer>;

    #[inline]
    fn render<'w>(
        item: &P,
        _view: (),
        instance_buffer: Option<&'w InstanceBuffer>,
        (meshes, render_mesh_instances): SystemParamItem<'w, '_, Self::Param>,
        pass: &mut TrackedRenderPass<'w>,
    ) -> RenderCommandResult {
        let Some(mesh_instance) = render_mesh_instances.get(&item.entity()) else {
            error!("Mesh instance not found for entity {:?}", item.entity());
            return RenderCommandResult::Failure;
        };

        let gpu_mesh = match meshes.into_inner().get(mesh_instance.mesh_asset_id) {
            Some(gpu_mesh) => gpu_mesh,
            None => {
                error!("Mesh not found for entity {:?}", item.entity());
                return RenderCommandResult::Failure;
            }
        };

        let Some(instance_buffer) = instance_buffer else {
            error!("Instance buffer not found for entity {:?}", item.entity());
            return RenderCommandResult::Failure;
        };

        pass.set_vertex_buffer(0, gpu_mesh.vertex_buffer.slice(..));
        pass.set_vertex_buffer(1, instance_buffer.buffer.slice(..));

        match &gpu_mesh.buffer_info {
            GpuBufferInfo::Indexed {
                buffer,
                index_format,
                count,
            } => {
                pass.set_index_buffer(buffer.slice(..), 0, *index_format);
                pass.draw_indexed(0..*count, 0, 0..instance_buffer.length as u32);
            }
            GpuBufferInfo::NonIndexed => {
                pass.draw(0..gpu_mesh.vertex_count, 0..instance_buffer.length as u32);
            }
        }
        RenderCommandResult::Success
    }
}
