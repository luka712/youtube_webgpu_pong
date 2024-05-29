import { GeometryBuffers } from "../attribute_buffers/GeometryBuffers";
import { ShadowCamera } from "../camera/ShadowCamera";
import shaderSource from "../shaders/ShadowShader.wgsl?raw"
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";


/**
 * The shadow render pipeline. We use it to draw to shadow textzre map.
 */
export class ShadowRenderPipeline {

    // Render pipeline
    private _renderPipeline: GPURenderPipeline;

    // Bind groups
    private _projectionViewBindGroup!: GPUBindGroup;
    private _vertexBindGroup!: GPUBindGroup;

    /**
     * Creates a new shadow render pipeline.
     * @param device - The GPU device.
     * @param camera - The shadow camera. The camera that we want to project the shadow from.
     * @param transformsBuffer - The buffer with the transforms.
     */
    constructor(device: GPUDevice, camera: ShadowCamera, transformsBuffer: UniformBuffer) {

        // - SHADER MODULE
        const shaderModule = device.createShaderModule({
            code: shaderSource
        });

        // - VERTEX BUFFER LAYOUT
        const bufferLayout: Array<GPUVertexBufferLayout> = [];

        bufferLayout.push({
            arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
                {
                    shaderLocation: 0,
                    offset: 0,
                    format: "float32x3"
                }
            ],
        });

        // - BIND GROUP LAYOUTS
        const vertexGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
            ]
        });

        // The projection view group - for camera
        const projectionViewGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                }
            ]
        });

        const layout = device.createPipelineLayout({
            bindGroupLayouts: [
                vertexGroupLayout, // group 0,
                projectionViewGroupLayout, // group 1
            ]
        });

        // - RENDER PIPELINE
        this._renderPipeline = device.createRenderPipeline({
            layout: layout,
            label: "Shadow Render Pipeline",
            vertex: {
                buffers: bufferLayout,
                module: shaderModule,
                entryPoint: "shadowVS"
            },
            // CONFIGURE DEPTH,
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: "less",
                format: "depth32float"
            }
        });


        // - BIND GROUPS
        this._vertexBindGroup = device.createBindGroup({
            layout: vertexGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: transformsBuffer.buffer
                    }
                }
            ]
        });

        this._projectionViewBindGroup = device.createBindGroup({
            layout: projectionViewGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: camera.buffer.buffer
                    }
                }
            ]

        })
    }

    /**
     * Draws the shadows to the shadow texture map.
     * @param renderPassEncoder - The render pass encoder.
     * @param buffers - The geometry buffers.
     * @param instanceCount - The number of instances to draw. By default, 1.
     */
    public draw(
        renderPassEncoder: GPURenderPassEncoder,
        buffers: GeometryBuffers,
        instanceCount = 1) 
        
    {
        renderPassEncoder.setPipeline(this._renderPipeline);
        renderPassEncoder.setVertexBuffer(0, buffers.positionsBuffer);

        // passes texture
        renderPassEncoder.setBindGroup(0, this._vertexBindGroup);
        renderPassEncoder.setBindGroup(1, this._projectionViewBindGroup);

        // draw with indexed buffer 
        if (buffers.indicesBuffer) {
            renderPassEncoder.setIndexBuffer(buffers.indicesBuffer, "uint16");
            renderPassEncoder.drawIndexed(buffers.indexCount!, instanceCount, 0, 0, 0);
        }
        else {
            renderPassEncoder.draw(buffers.vertexCount, instanceCount, 0, 0);
        }
    }

}