import { Mat4x4 } from "../math/Mat4x4";
import { Vec2 } from "../math/Vec2";
import { Vec3 } from "../math/Vec3";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";

export class ShadowCamera {
    // BUFFER
    public buffer: UniformBuffer;

    // VIEW PROPERTIES
    public eye = new Vec3(0, 0, -3);
    public target = new Vec3(0, 0, 0);
    private up = new Vec3(0, 1, 0);

    // ORTHOGRAPHIC PROPERTIES
    public near = 0.01;
    public far = 100;

    // MATRICES
    private perspective = Mat4x4.identity();
    private view = Mat4x4.identity();
    private projectionView = Mat4x4.identity();

    constructor(device: GPUDevice) {
        this.buffer = new UniformBuffer(device, this.projectionView, "Shadow Camera Buffer");
    }

    public update() {
        this.view = Mat4x4.lookAt(this.eye, this.target, this.up);
        this.perspective = Mat4x4.orthographic(-20, 20, -20, 20, this.near, this.far);
        this.projectionView = Mat4x4.multiply(this.perspective, this.view);

        this.buffer.update(this.projectionView);
    }
}