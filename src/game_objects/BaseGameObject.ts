import { GeometryBuffersCollection } from "../attribute_buffers/GeometryBuffersCollection";
import { Camera } from "../camera/Camera";
import { ShadowCamera } from "../camera/ShadowCamera";
import { RectCollider } from "../collider/RectCollider";
import { AmbientLight } from "../lights/AmbientLight";
import { DirectionalLight } from "../lights/DirectionalLight";
import { PointLightsCollection } from "../lights/PointLight";
import { Color } from "../math/Color";
import { Mat3x3 } from "../math/Mat3x3";
import { Mat4x4 } from "../math/Mat4x4";
import { Vec2 } from "../math/Vec2";
import { Vec3 } from "../math/Vec3";
import { RenderPipeline } from "../render_pipelines/RenderPipeline";
import { ShadowRenderPipeline } from "../render_pipelines/ShadowRenderPipeline";
import { Texture2D } from "../texture/Texture2D";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";
import { Paddle } from "./Paddle";

/**
 * The base game object class.
 */
export abstract class BaseGameObject {

    // - PIPELINES
    protected readonly _pipeline: RenderPipeline;
    protected readonly _shadowPipeline: ShadowRenderPipeline;

    // - BUFFERS
    protected _transformBufferName = "Game Object Transform Buffer";
    protected _normalMatrixBufferName = "Game Object Normal Matrix Buffer";

    protected _transformBuffer: UniformBuffer;
    protected _normalMatrixBuffer: UniformBuffer;

    // - DATA

    private _transform = Mat4x4.identity();

    /**
     * The scale of the game object.
     */
    public scale = new Vec3(1, 1, 1);

    /**
     * The position of the game object.
     */
    public position = new Vec3(0, 0, 0);

    /**
     * The color of the game object.
     */
    public color = new Color(1, 1, 1, 1);

    /**
     * The collider of the game object.
     */
    public collider = new RectCollider();

    /**
     * Sets the camera of the game object.
     */
    public set camera(camera: Camera) {
        this._pipeline.camera = camera;
    }

    /**
     * Sets the shadow texture.
     */
    public set shadowTexture(texture: Texture2D) {
        this._pipeline.shadowTexture = texture;
    }

    /**
     * The base game object constructor.
     * @param device - The GPU device.
     * @param camera - The camera.
     * @param shadowCamera - The shadow camera.
     * @param ambientLight - The ambient light.
     * @param directionalLight - The directional light.
     * @param pointLights - The point lights.
     */
    constructor(
        device: GPUDevice,
        camera: Camera,
        shadowCamera: ShadowCamera,
        ambientLight: AmbientLight,
        directionalLight: DirectionalLight,
        pointLights: PointLightsCollection) {

        this._transformBuffer = new UniformBuffer(device, this._transform, this._transformBufferName);
        this._normalMatrixBuffer = new UniformBuffer(device, 16 * Float32Array.BYTES_PER_ELEMENT, this._normalMatrixBufferName);

        this._pipeline = new RenderPipeline(device,
            camera,
            shadowCamera,
            this._transformBuffer,
            this._normalMatrixBuffer,
            ambientLight,
            directionalLight,
            pointLights);

        this._shadowPipeline = new ShadowRenderPipeline(
            device,
            shadowCamera,
            this._transformBuffer);
    }

    /**
     * Handles the transform update.
     * Updates the transform and normal matrix buffers.
     */
    protected _handleTransformUpdate() {

        const scale = Mat4x4.scale(this.scale.x, this.scale.y, this.scale.z);
        const translate = Mat4x4.translation(this.position.x, this.position.y, this.position.z);
        this._transform = Mat4x4.multiply(translate, scale);

        this._transformBuffer.update(this._transform);

        let normalMatrix = Mat3x3.fromMat4x4(this._transform);
        normalMatrix = Mat3x3.transpose(normalMatrix);
        normalMatrix = Mat3x3.inverse(normalMatrix);
        this._normalMatrixBuffer.update(Mat3x3.to16AlignedMat3x3(normalMatrix));
    }

    /**
     * Updates the collider.
     */
    protected _updateCollider() {

        this.collider.x = this.position.x - this.scale.x / 2;
        this.collider.y = this.position.y - this.scale.y / 2;
        this.collider.width = this.scale.x;
        this.collider.height = this.scale.y;
    }

    /**
     * The update method. Must be called every frame.
     */
    public abstract update(): void;

    /**
     * Draws the game object.
     * @param renderPassEncoder - The render pass encoder.
     */
    public draw(renderPassEncoder: GPURenderPassEncoder) {
        this._pipeline.diffuseColor = this.color;
        this._pipeline.draw(renderPassEncoder, GeometryBuffersCollection.cubeBuffers);
    }

    /**
     * Draws the shadows of the game object.
     * @param renderPassEncoder - The render pass encoder.
     */
    public drawShadows(renderPassEncoder: GPURenderPassEncoder) {
        this._shadowPipeline.draw(renderPassEncoder, GeometryBuffersCollection.cubeBuffers);
    }
}