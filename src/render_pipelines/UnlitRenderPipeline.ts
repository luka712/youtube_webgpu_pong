import { GeometryBuffers } from "../attribute_buffers/GeometryBuffers";
import { Color } from "../math/Color";
import { Vec2 } from "../math/Vec2";
import shaderSource from "../shaders/UnlitMaterialShader.wgsl?raw"
import { Texture2D } from "../texture/Texture2D";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";


export class UnlitRenderPipeline {

    private renderPipeline: GPURenderPipeline;
    private textureBindGroupLayout: GPUBindGroupLayout;

    private diffuseTextureBindGroup!: GPUBindGroup;
    private textureTillingBindGroup!: GPUBindGroup;
    private diffuseColorBindGroup!: GPUBindGroup;

    public set diffuseTexture(texture: Texture2D) {
        this.diffuseTextureBindGroup = this.createTextureBindGroup(texture);
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

    constructor(private device: GPUDevice) {

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

        const textureTillingGroupLayout = device.createBindGroupLayout({
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
                textureTillingGroupLayout, // group 0
                this.textureBindGroupLayout, // group 1
                diffuseColorGroupLayout // group 2
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

        this.textureTillingBindGroup = device.createBindGroup({
            layout: textureTillingGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.textureTillingBuffer.buffer
                    }
                }
            ]
        });

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
        renderPassEncoder.setBindGroup(0, this.textureTillingBindGroup);
        renderPassEncoder.setBindGroup(1, this.diffuseTextureBindGroup);
        renderPassEncoder.setBindGroup(2, this.diffuseColorBindGroup);

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