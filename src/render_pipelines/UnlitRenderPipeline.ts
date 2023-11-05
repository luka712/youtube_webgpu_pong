import { GeometryBuffers } from "../attribute_buffers/GeometryBuffers";
import shaderSource from "../shaders/UnlitMaterialShader.wgsl?raw"
import { Texture2D } from "../texture/Texture2D";


export class UnlitRenderPipeline {

    private renderPipeline: GPURenderPipeline;
    private textureBindGroupLayout: GPUBindGroupLayout;

    private diffuseTextureBindGroup!: GPUBindGroup;

    private _diffuseTexture?: Texture2D;

    public set diffuseTexture(texture: Texture2D) {
        this._diffuseTexture = texture;
        this.diffuseTextureBindGroup = this.createTextureBindGroup(texture);
    }

    constructor(private device: GPUDevice) {

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

        const layout = device.createPipelineLayout({
            bindGroupLayouts: [this.textureBindGroupLayout]
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
    }

    private createTextureBindGroup( texture: Texture2D) {
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
        renderPassEncoder.setBindGroup(0, this.diffuseTextureBindGroup);

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