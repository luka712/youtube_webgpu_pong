
/**
 * The uniform buffer wrapper over the GPUBuffer.
 */
export class UniformBuffer {
    
    /**
     * The GPUBuffer object. Should be used in the bindGroup.
     */
    public readonly buffer: GPUBuffer;

    /**
     * The constructor of the UniformBuffer class.
     * @param _device - The GPUDevice object.
     * @param dataOrLength - The data or the byte size of the buffer.
     * @param label  - The label of the buffer. By default, it is "Uniform Buffer".
     */
    constructor(private _device: GPUDevice, dataOrLength: Float32Array | number, label: string = "Uniform Buffer") {
        
        // if number, we assume byteSize
        if (typeof dataOrLength === "number") {
            this.buffer = _device.createBuffer({
                label: label,
                size: dataOrLength, 
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }); 
        }
        else {
            this.buffer = _device.createBuffer({
                label: label,
                size: dataOrLength.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });

            this.update(dataOrLength);
        }
    }

    /**
     * Update the buffer with the new data.
     * @param data - The new data.
     * @param bufferOffset - The offset in the buffer.
     */
    public update(data: Float32Array, bufferOffset = 0) {
        this._device.queue.writeBuffer(this.buffer, bufferOffset, data.buffer);
    }
}