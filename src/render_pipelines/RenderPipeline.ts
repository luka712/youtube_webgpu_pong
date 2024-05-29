import { GeometryBuffers } from "../attribute_buffers/GeometryBuffers";
import { Camera } from "../camera/Camera";
import { ShadowCamera } from "../camera/ShadowCamera";
import { AmbientLight } from "../lights/AmbientLight";
import { DirectionalLight } from "../lights/DirectionalLight";
import { PointLightsCollection } from "../lights/PointLight";
import { Color } from "../math/Color";
import { Vec2 } from "../math/Vec2";
import shaderSource from "../shaders/MaterialShader.wgsl?raw"
import { Texture2D } from "../texture/Texture2D";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";

/**
 * The render pipeline with light and shadow support.
 */
export class RenderPipeline {

    private _renderPipeline: GPURenderPipeline;

    // Bind group layouts
    private _materialBindGroupLayout: GPUBindGroupLayout;
    private _camerasViewGroupLayout: GPUBindGroupLayout;

    // Bind groups
    private _vertexBindGroup!: GPUBindGroup;
    private _camerasViewBindGroup!: GPUBindGroup;
    private _materialBindGroup!: GPUBindGroup;
    private _lightsBindGroup!: GPUBindGroup;

    // Fields
    private _textureTilling: Vec2 = new Vec2(1, 1);
    private _diffuseTexture!: Texture2D;
    private _shadowTexture!: Texture2D;
    private _diffuseColor: Color = Color.white();
    private _shininess = 32;

    // Buffers
    private _textureTillingBuffer: UniformBuffer;
    private _diffuseColorBuffer: UniformBuffer;
    private _shininessBuffer: UniformBuffer;

    /**
     * Sets the diffuse texture.
     */
    public set diffuseTexture(texture: Texture2D) {
        this._diffuseTexture = texture;

        if (this._diffuseTexture != null && this._shadowTexture != null) {
            this._materialBindGroup = this._createMaterialBindGroup(texture, this._shadowTexture);
        }
    }

    /**
     * Sets the shadow texture.
     */
    public set shadowTexture(texture: Texture2D) {
        this._shadowTexture = texture;

        if (this._diffuseTexture != null && this._shadowTexture != null) {
            this._materialBindGroup = this._createMaterialBindGroup(this._diffuseTexture, texture);
        }
    }

    /**
     * Sets the texture tilling.
     */
    public set textureTilling(value: Vec2) {
        this._textureTilling = value;
        this._textureTillingBuffer.update(value);
    }

    /**
     * The diffuse color.
     */
    public set diffuseColor(value: Color) {
        this._diffuseColor = value;
        this._diffuseColorBuffer.update(value);
    }

    /**
     * Sets the shininess.
     */
    public set shininess(value: number) {
        this._shininess = value;
        this._shininessBuffer.update(new Float32Array([value]));
    }

    /**
     * Sets the camera.
     */
    public set camera(camera: Camera) {
        if (this._camera != camera) {
            this._camera = camera;
            this._createCamerasViewBindGroup();
        }
    }

    /**
     * The constructor for the render pipeline.
     * @param _device - The GPU device.
     * @param _camera - The camera which will be used for rendering.
     * @param _shadowCamera - The shadow camera. Where to project shadow from.
     * @param transformsBuffer - The buffer with the transforms.
     * @param normalMatrixBuffer - The buffer with the normal matrices.
     * @param ambientLight - The ambient light.
     * @param directionalLight - The directional light.
     * @param pointLights - The point lights.
     */
    constructor(
        private _device: GPUDevice,
        private _camera: Camera,
        private _shadowCamera: ShadowCamera,
        transformsBuffer: UniformBuffer,
        normalMatrixBuffer: UniformBuffer,
        ambientLight: AmbientLight,
        directionalLight: DirectionalLight,
        pointLights: PointLightsCollection) {

        // - BUFFERS
        // First initialize the buffers
        this._textureTillingBuffer = new UniformBuffer(_device,
            this._textureTilling,
            "Texture Tilling Buffer");

        this._diffuseColorBuffer = new UniformBuffer(_device,
            this._diffuseColor,
            "Diffuse Color Buffer");

        this._shininessBuffer = new UniformBuffer(_device,
            new Float32Array([this._shininess]),
            "Shininess Buffer");

        // - SHADER MODULE
        // Create the shader module
        const shaderModule = _device.createShaderModule({
            code: shaderSource
        });

        // - BUFFER LAYOUTS
        // We need buffer layouts to describe the vertex buffers
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
        });

        bufferLayout.push({
            arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
                {
                    shaderLocation: 3,
                    offset: 0,
                    format: "float32x3"
                }
            ],
        });

        // - BIND GROUP LAYOUTS
        // Describe the bind group layouts. This describes the layout of the bind groups.
        const vertexGroupLayout = _device.createBindGroupLayout({
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
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                }
            ]
        });

        // The projection view group - for camera
        this._camerasViewGroupLayout = _device.createBindGroupLayout({
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
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                }
            ]
        });

        this._materialBindGroupLayout = _device.createBindGroupLayout({
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
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "depth"
                    }
                },
                {
                    binding: 5,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "comparison"
                    }
                }
            ]
        });

        const lightsBindGroupLayout = _device.createBindGroupLayout({
            label: "Lights Bind Group Layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {}
                }
            ]
        });

        // Create the layout
        const layout = _device.createPipelineLayout({
            bindGroupLayouts: [
                vertexGroupLayout, // group 0,
                this._camerasViewGroupLayout, // group 1
                this._materialBindGroupLayout, // group 2
                lightsBindGroupLayout // group 3
            ]
        });

        // - RENDER PIPELINE
        // Now we can create a render pipeline
        this._renderPipeline = _device.createRenderPipeline({
            layout: layout,
            label: "Render Pipeline",
            vertex: {
                buffers: bufferLayout,
                module: shaderModule,
                entryPoint: "materialVS"
            },
            fragment: {
                module: shaderModule,
                entryPoint: "materialFS",
                targets: [{
                    format: "bgra8unorm"
                }]
            },
            // CONFIGURE DEPTH,
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: "less",
                format: "depth32float"
            }
        });

        // - TEXTURES
        // Set the default texture
        this.diffuseTexture = Texture2D.createEmpty(_device);

        // - BIND GROUPS
        // Create the bind groups
        this._vertexBindGroup = _device.createBindGroup({
            layout: vertexGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: transformsBuffer.buffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: normalMatrixBuffer.buffer
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this._textureTillingBuffer.buffer
                    }
                }
            ]
        });

        this._createCamerasViewBindGroup();

        this._lightsBindGroup = _device.createBindGroup({
            label: "Lights Bind Group",
            layout: lightsBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: ambientLight.buffer.buffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: directionalLight.buffer.buffer
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: pointLights.buffer.buffer
                    }
                }
            ]
        });
    }

    /**
     * Creates the bind group releated to the camera and shadow camera.
     */
    private _createCamerasViewBindGroup() {

        this._camerasViewBindGroup = this._device.createBindGroup({
            layout: this._camerasViewGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this._camera.buffer.buffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this._camera.eyeBuffer.buffer
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this._shadowCamera.buffer.buffer
                    }
                }
            ]
        });
    }

    /**
     * Creates the material bind group.
     * @param texture - The texture.
     * @param shadowTexture - The shadow texture.
     * @returns The material bind group.
     */
    private _createMaterialBindGroup(texture: Texture2D, shadowTexture: Texture2D) {
        return this._device.createBindGroup({
            layout: this._materialBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: texture.texture.createView()
                },
                {
                    binding: 1,
                    resource: texture.sampler
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this._diffuseColorBuffer.buffer
                    }
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this._shininessBuffer.buffer
                    }
                },
                {
                    binding: 4,
                    resource: shadowTexture.texture.createView()
                },
                {
                    binding: 5,
                    resource: shadowTexture.sampler
                }
            ]
        });
    }

    /**
     * Draws the pipeline.
     * @param renderPassEncoder - The render pass encoder. 
     * @param buffers - The buffers.
     * @param instanceCount - The instance count. By default, 1.
     */
    public draw(
        renderPassEncoder: GPURenderPassEncoder,
        buffers: GeometryBuffers,
        instanceCount = 1) {
        renderPassEncoder.setPipeline(this._renderPipeline);
        renderPassEncoder.setVertexBuffer(0, buffers.positionsBuffer);
        renderPassEncoder.setVertexBuffer(1, buffers.colorsBuffer);
        renderPassEncoder.setVertexBuffer(2, buffers.texCoordsBuffer);
        renderPassEncoder.setVertexBuffer(3, buffers.normalsBuffer);

        // passes texture
        renderPassEncoder.setBindGroup(0, this._vertexBindGroup);
        renderPassEncoder.setBindGroup(1, this._camerasViewBindGroup);
        renderPassEncoder.setBindGroup(2, this._materialBindGroup);
        renderPassEncoder.setBindGroup(3, this._lightsBindGroup);

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