import { Mat4x4 } from "../math/Mat4x4";
import { Vec3 } from "../math/Vec3";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";

/**
 * The camera class.
 */
export class Camera {

    // - BUFFERS

    /**
     * The camera uniform buffer. Holds the projection view matrix.
     */
    public buffer: UniformBuffer;

    /**
     * The eye uniform buffer. Holds the eye position.
     */
    public eyeBuffer: UniformBuffer;

    // - VIEW PROPERTIES

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
    public up = new Vec3(0, 1, 0);

    // - PERSPECTIVE PROPERTIES

    /**
     * The field of view of the camera in degrees.
     */
    public fov = 45;

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

    /**
     * The camera class.
     * @param device - The GPU device.
     * @param aspectRatio - The aspect ratio of the camera. Usually canvas width / canvas height.
     */
    constructor(device: GPUDevice, private aspectRatio: number) {
        this.buffer = new UniformBuffer(device, this._projectionView, "Camera Projection View Matrix Buffer");
        this.eyeBuffer = new UniformBuffer(device, 16, "Camera Eye Buffer");
    }

    /**
     * Updates the camera. Must be called every frame.
     */
    public update() {
        this._view = Mat4x4.lookAt(this.eye, this.target, this.up);
        this._perspective = Mat4x4.perspective(this.fov, this.aspectRatio, this.near, this.far);
        this._projectionView = Mat4x4.multiply(this._perspective, this._view);

        this.buffer.update(this._projectionView);
        this.eyeBuffer.update(this.eye);
    }
}