import { Mat4x4 } from "../math/Mat4x4";
import { Vec3 } from "../math/Vec3";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";

/**
 * The shadow camera class. Used for shadow mapping.
 */
export class ShadowCamera {
    // BUFFER

    /**
     * The shadow camera uniform buffer. Holds the projection view matrix.
     */
    public buffer: UniformBuffer;

    // VIEW PROPERTIES

    /**
     * The position of the camera in the world.
     */
    public eye = new Vec3(0, 0, -3);

    /**
     * The target of the camera. Where the camera is looking at.
     */
    public target = new Vec3(0, 0, 0);

    /**
     * The up vector of the camera. Orientation of the camera.
     */
    private up = new Vec3(0, 1, 0);

    // ORTHOGRAPHIC PROPERTIES

    /**
     * The near plane of the camera. Anything closer than this will not be rendered.
     */
    public near = 0.01;

    /**
     * The far plane of the camera. Anything further than this will not be rendered.
     */
    public far = 100;

    // MATRICES
    private _perspective = Mat4x4.identity();
    private _view = Mat4x4.identity();
    private _projectionView = Mat4x4.identity();

    constructor(device: GPUDevice) {
        this.buffer = new UniformBuffer(device, this._projectionView, "Shadow Camera Projection View Matrix Buffer");
    }

    public update() {
        this._view = Mat4x4.lookAt(this.eye, this.target, this.up);
        this._perspective = Mat4x4.orthographic(-20, 20, -20, 20, this.near, this.far);
        this._projectionView = Mat4x4.multiply(this._perspective, this._view);

        this.buffer.update(this._projectionView);
    }
}