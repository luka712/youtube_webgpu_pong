import { GeometryBuffersCollection } from "../attribute_buffers/GeometryBuffersCollection";
import { Camera } from "../camera/Camera";
import { ShadowCamera } from "../camera/ShadowCamera";
import { InputManager } from "../input/InputManager";
import { AmbientLight } from "../lights/AmbientLight";
import { DirectionalLight } from "../lights/DirectionalLight";
import { PointLight, PointLightsCollection } from "../lights/PointLight";
import { Color } from "../math/Color";
import { Mat3x3 } from "../math/Mat3x3";
import { Mat4x4 } from "../math/Mat4x4";
import { Vec2 } from "../math/Vec2";
import { Vec3 } from "../math/Vec3";
import { RenderPipeline } from "../render_pipelines/RenderPipeline";
import { ShadowRenderPipeline } from "../render_pipelines/ShadowRenderPipeline";
import { UnlitRenderPipeline } from "../render_pipelines/UnlitRenderPipeline";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";

export class Paddle {
    public pipeline: RenderPipeline;
    private shadowPipeline: ShadowRenderPipeline;

    private transformBuffer: UniformBuffer;
    private normalMatrixBuffer: UniformBuffer;

    private transform = Mat4x4.identity();

    public scale = new Vec3(1, 5, 1);
    public position = new Vec3(0, 0, 0);

    public color = new Color(1, 1, 1, 1);

    private speed = 0.2;
    public playerOne = true;


    constructor(device: GPUDevice,
        private inputManager: InputManager,
        camera: Camera, shadowCamera: ShadowCamera,
        ambientLight: AmbientLight, directionalLight: DirectionalLight, pointLights: PointLightsCollection) {

        this.transformBuffer = new UniformBuffer(device, this.transform, "Paddle Transform");

        this.normalMatrixBuffer = new UniformBuffer(device, 16 * Float32Array.BYTES_PER_ELEMENT, "Paddle Normal Matrix");

        this.pipeline = new RenderPipeline(device, camera, shadowCamera, this.transformBuffer, this.normalMatrixBuffer,
            ambientLight, directionalLight, pointLights);

        this.shadowPipeline = new ShadowRenderPipeline(device, shadowCamera, this.transformBuffer);
    }

    public update() {

        let dirY = 0;

        if(this.playerOne){
            if(this.inputManager.isKeyDown("w")){
                dirY = 1;
            }
            if(this.inputManager.isKeyDown("s")){
                dirY = -1;
            }
        }
        else {
            if(this.inputManager.isKeyDown("ArrowUp")){
                dirY = 1;
            }
            if(this.inputManager.isKeyDown("ArrowDown")){
                dirY = -1;
            }
        }

        this.position.y += dirY * this.speed;

        if(this.position.y > 5)
            this.position.y = 5;
        if(this.position.y < -5)
            this.position.y = -5;

        const scale = Mat4x4.scale(this.scale.x, this.scale.y, this.scale.z);
        const translate = Mat4x4.translation(this.position.x, this.position.y, this.position.z);

        this.transform = Mat4x4.multiply(translate, scale);

        let normalMatrix = Mat3x3.fromMat4x4(this.transform);
        normalMatrix = Mat3x3.transpose(normalMatrix);
        normalMatrix = Mat3x3.inverse(normalMatrix);

        this.normalMatrixBuffer.update(Mat3x3.to16AlignedMat3x3(normalMatrix));

        this.transformBuffer.update(this.transform);
    }

    public draw(renderPassEncoder: GPURenderPassEncoder) {
        this.pipeline.diffuseColor = this.color;
        this.pipeline.draw(renderPassEncoder, GeometryBuffersCollection.cubeBuffers);
    }

    public drawShadows(renderPassEncoder: GPURenderPassEncoder) {
        this.shadowPipeline.draw(renderPassEncoder, GeometryBuffersCollection.cubeBuffers);
    }
}