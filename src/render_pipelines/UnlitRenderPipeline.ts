import { GeometryBuffers } from "../attribute_buffers/GeometryBuffers";
import shaderSource from "../shaders/UnlitMaterialShader.wgsl?raw"


export class UnlitRenderPipeline {

    private renderPipeline: GPURenderPipeline;

    constructor(device: GPUDevice) {

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


        this.renderPipeline = device.createRenderPipeline({
            layout: "auto",
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

    }

    public draw(renderPassEncoder: GPURenderPassEncoder, buffers: GeometryBuffers) {
        renderPassEncoder.setPipeline(this.renderPipeline);
        renderPassEncoder.setVertexBuffer(0, buffers.positionsBuffer);
        renderPassEncoder.setVertexBuffer(1, buffers.colorsBuffer);

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