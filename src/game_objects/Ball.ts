import { Camera } from "../camera/Camera";
import { GeometryBuffersCollection } from "../geometry/GeometryBuffersCollection";
import { Color } from "../math/Color";
import { Mat4x4 } from "../math/Mat4x4";
import { Vec2 } from "../math/Vec2";
import { Vec3 } from "../math/Vec3";
import { UnlitRenderPipeline } from "../render_pipelines/UnlitRenderPipeline";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";

export class Ball {
    private pipeline: UnlitRenderPipeline;
    private transformBuffer: UniformBuffer;

    private transform = Mat4x4.identity();

    public scale = new Vec3(1, 1, 1);
    public position = new Vec3(0, 0, 0);

    public color = new Color(1, 1, 1, 1);

    constructor(device: GPUDevice, camera: Camera) {
        this.transformBuffer = new UniformBuffer(device, this.transform, "Ball Transform");
        this.pipeline = new UnlitRenderPipeline(device, camera, this.transformBuffer);
    }

    public update() {
        const scale = Mat4x4.scale(this.scale.x, this.scale.y, this.scale.z);
        const translate = Mat4x4.translation(this.position.x, this.position.y, this.position.z);
        this.transform = Mat4x4.multiply(translate, scale);

        this.transformBuffer.update(this.transform);
    }

    public draw(renderPassEncoder: GPURenderPassEncoder) {
        this.pipeline.diffuseColor = this.color;
        this.pipeline.draw(renderPassEncoder, GeometryBuffersCollection.cubeBuffers);
    }
}