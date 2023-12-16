import { Mat4x4 } from "../math/Mat4x4";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";

export class Camera
{
    public buffer: UniformBuffer;

    private _projectionView: Mat4x4 = Mat4x4.identity();

    public set projectionView(value: Mat4x4)
    {
        this._projectionView = value;
        this.buffer.update(this._projectionView);
    }

    constructor(device: GPUDevice)
    {
        this.buffer = new UniformBuffer(device, this._projectionView, "Camera Buffer");
    }
}