import { Color } from "../math/Color";
import { UniformBuffer } from "../uniform_buffers/UniformBuffer";

/**
 * The base light class.
 */
export abstract class BaseLight {
    /**
     * The color of the light.
     */
    public color = new Color(1, 1, 1, 1);

    /**
     * The intensity of the light.
     */
    public intensity = 1;

    /**
     * The GPU memory buffer for the light.
     */
    public buffer!: UniformBuffer;

    /**
     * Updates the light. Must be called to update the GPU buffer.
     */
    public abstract update(): void;
}