import { GeometryBuffers } from "../attribute_buffers/GeometryBuffers";
import { Camera } from "../camera/Camera";
import { Color } from "../math/Color";
import { Mat4x4 } from "../math/Mat4x4";
import { Vec2 } from "../math/Vec2";
import shaderSource from "../shaders/UnlitMaterialShader.wgsl?raw"
import { Texture2D } from "../texture/Texture2D";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";


export class UnlitRenderPipeline {

    private renderPipeline: GPURenderPipeline;
    private textureBindGroupLayout: GPUBindGroupLayout;

    private diffuseTextureBindGroup!: GPUBindGroup;
    private projectionViewBindGroup!: GPUBindGroup;
    private vertexBindGroup!: GPUBindGroup;
    private diffuseColorBindGroup!: GPUBindGroup;

    public set diffuseTexture(texture: Texture2D) {
        this.diffuseTextureBindGroup = this.createTextureBindGroup(texture);
    }

    private transformBuffer: UniformBuffer;
    private _transform: Mat4x4 = new Mat4x4();

    public set transform(value: Mat4x4) {
        this._transform = value;
        this.transformBuffer.update(value);
    }

    private textureTillingBuffer: UniformBuffer;
    private _textureTilling: Vec2 = new Vec2(1, 1);

    public set textureTilling(value: Vec2) {
        this._textureTilling = value;
        this.textureTillingBuffer.update(value);
    }

    private diffuseColorBuffer: UniformBuffer;
    private _diffuseColor: Color = Color.white();

    public set diffuseColor(value: Color) {
        this._diffuseColor = value;
        this.diffuseColorBuffer.update(value);
    }

    constructor(private device: GPUDevice, camera: Camera) {

        this.transformBuffer = new UniformBuffer(device,
            this._transform,
            "Transform Buffer");

        this.textureTillingBuffer = new UniformBuffer(device,
            this._textureTilling,
            "Texture Tilling Buffer");

        this.diffuseColorBuffer = new UniformBuffer(device,
            this._diffuseColor,
            "Diffuse Color Buffer");


        const shaderModule = device.createShaderModule({
            code: shaderSource
        });

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
        })

        bufferLayout.push({
            arrayStride: 4 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
                {
                    shaderLocation: 1,
                    offset: 0,
                    format: "float32x4"
                }
            ],
        })

        bufferLayout.push({
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
                {
                    shaderLocation: 2,
                    offset: 0,
                    format: "float32x2"
                }
            ],
        })

        const vertexGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                }
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

        this.textureBindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                }
            ]
        });

        const diffuseColorGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                }
            ]
        });

        const layout = device.createPipelineLayout({
            bindGroupLayouts: [
                vertexGroupLayout, // group 0,
                projectionViewGroupLayout, // group 1
                this.textureBindGroupLayout, // group 2
                diffuseColorGroupLayout // group 3
            ]
        });

        this.renderPipeline = device.createRenderPipeline({
            layout: layout,
            label: "Unlit Render Pipeline",
            vertex: {
                buffers: bufferLayout,
                module: shaderModule,
                entryPoint: "unlitMaterialVS"
            },
            fragment: {
                module: shaderModule,
                entryPoint: "unlitMaterialFS",
                targets: [{
                    format: "bgra8unorm"
                }]
            }
        });

        this.diffuseTexture = Texture2D.createEmpty(device);

        this.vertexBindGroup = device.createBindGroup({
            layout: vertexGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.transformBuffer.buffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.textureTillingBuffer.buffer
                    }
                }
            ]
        });

        this.projectionViewBindGroup = device.createBindGroup({
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

        this.diffuseColorBindGroup = device.createBindGroup({
            layout: diffuseColorGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.diffuseColorBuffer.buffer
                    }
                }
            ]
        });
    }

    private createTextureBindGroup(texture: Texture2D) {
        return this.device.createBindGroup({
            layout: this.textureBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: texture.texture.createView()
                },
                {
                    binding: 1,
                    resource: texture.sampler
                }
            ]
        });
    }

    public draw(renderPassEncoder: GPURenderPassEncoder, buffers: GeometryBuffers) {
        renderPassEncoder.setPipeline(this.renderPipeline);
        renderPassEncoder.setVertexBuffer(0, buffers.positionsBuffer);
        renderPassEncoder.setVertexBuffer(1, buffers.colorsBuffer);
        renderPassEncoder.setVertexBuffer(2, buffers.texCoordsBuffer);

        // passes texture
        renderPassEncoder.setBindGroup(0, this.vertexBindGroup);
        renderPassEncoder.setBindGroup(1, this.projectionViewBindGroup);
        renderPassEncoder.setBindGroup(2, this.diffuseTextureBindGroup);
        renderPassEncoder.setBindGroup(3, this.diffuseColorBindGroup);

        // draw with indexed buffer 
        if (buffers.indicesBuffer) {
            renderPassEncoder.setIndexBuffer(buffers.indicesBuffer, "uint16");
            renderPassEncoder.drawIndexed(buffers.indexCount!, 1, 0, 0, 0);
        }
        else {
            renderPassEncoder.draw(buffers.vertexCount, 1, 0, 0);
        }
    }

}