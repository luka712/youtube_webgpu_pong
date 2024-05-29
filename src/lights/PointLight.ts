import { Color } from "../math/Color";
import { Vec3 } from "../math/Vec3";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";
import { BaseLight } from "./BaseLight";

/**
 * The base light class.
 */
export class PointLight extends BaseLight
{
    /**
     * Not required for point light.
     */
    public update(): void {
        // Left empty intentionally.
    }

    /**
     * The position of the light.
     */
    public position: Vec3 = new Vec3(0,0,0);

    /**
     * The attenuation constant.
     */
    public attenConst = 1;

    /**
     * The attenuation linear.
     */
    public attenLinear = 0.1;

    /**
     * The attenuation quadratic.
     */
    public attenQuad = 0.032;

    /**
     * The specular color of the light.
     */
    public specularColor = Color.white();

    /**
     * The specular intensity of the light.
     */
    public specularIntensity = 1;
}

/**
 * The collection of point lights.
 */
export class PointLightsCollection
{
    /**
     * The GPU memory buffer for the point lights.
     */
    public buffer: UniformBuffer;

    /**
     * The point lights.
     */
    public lights: PointLight[] = [
        new PointLight(),
        new PointLight(),
        new PointLight(),
    ];

    /**
     * The constructor for the point lights collection.
     * @param device The GPU device.
     */
    constructor(device: GPUDevice) {
        const byteSize = 3 * 16 * Float32Array.BYTES_PER_ELEMENT;
        this.buffer = new UniformBuffer(device, byteSize, "Directional Light Buffer");

    }

    /**
     * The update function for the point lights. Must be called to update the GPU buffer.
     */
    public update() 
    {
        for(let i = 0; i < this.lights.length; i++)
        {

            const data = new Float32Array([
                this.lights[i].color.r, this.lights[i].color.g, this.lights[i].color.b, this.lights[i].intensity,
                this.lights[i].position.x, this.lights[i].position.y, this.lights[i].position.z, this.lights[i].attenConst,
                this.lights[i].attenLinear, this.lights[i].attenQuad, 0,0,
                this.lights[i].specularColor.r, this.lights[i].specularColor.g, this.lights[i].specularColor.b, this.lights[i].specularIntensity
            ]);

            this.buffer.update(data, i * 16 * Float32Array.BYTES_PER_ELEMENT);
        }
    }
}