
/**
 * The texture wrapper over the GPUTexture and GPUSampler.
 */
export class Texture2D {

    /**
     * The GPUTexture object.
     */
    public texture!: GPUTexture;

    /**
     * The GPUSampler object.
     */
    public sampler!: GPUSampler;

    /**
     * The constructor of the Texture2D class.
     * @param _device - The GPUDevice object.
     * @param texture - The GPUTexture object or null.
     */
    constructor(private _device: GPUDevice, texture: GPUTexture | null = null) {
        if (texture) {
            this.texture = texture;
        }
    }

    /**
     * Create a texture from an image.
     * @param device - The GPUDevice object.
     * @param image - The HTMLImageElement object.
     * @returns The Texture2D object.
     */
    public static async create(device: GPUDevice, image: HTMLImageElement) {
        const texture = new Texture2D(device);
        await texture.initialize(image);
        return texture;
    }

    /**
     * Creates an empty texture. It is 1x1 white texture.
     * @param device - The GPUDevice object.
     * @returns The Texture2D object.
     */
    public static createEmpty(device: GPUDevice): Texture2D {
        const texture = new Texture2D(device);
        texture.initializeFromData(new Uint8Array([255, 255, 255, 255]), 1, 1);
        return texture;
    }

    /**
     * Creates a depth texture.
     * @param device - The GPUDevice object.
     * @param width - The width of the texture.
     * @param height - The height of the texture.
     * @returns The Texture2D object which can be used as a depth texture.
     */
    public static createDepthTexture(device: GPUDevice, width: number, height: number) {
        const depthTexture = device.createTexture({
            label: "Depth Texture",
            size: {
                width: width,
                height: height,
            },
            format: "depth32float",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        return new Texture2D(device, depthTexture);
    }

    /**
     * Creates a texture that can be used as a shadow map.
     * @param device - The GPUDevice object.
     * @param width - The width of the texture.
     * @param height - The height of the texture.
     * @returns The Texture2D object which can be used as a shadow map.
     */
    public static createShadowTexture(device: GPUDevice, width: number, height: number) {
        const depthTexture = device.createTexture({
            label: "Shadow Map Depth Texture",
            size: {
                width: width,
                height: height,
            },
            format: "depth32float",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING
        });

        const tex = new Texture2D(device, depthTexture);

        tex.sampler = device.createSampler({
            compare: "less-equal",
        });

        return tex;
    }

    /**
     * Creates a texture and a sampler.
     * @param width - The width of the texture.
     * @param height - The height of the texture.
     */
    private _createTextureAndSampler(width: number, height: number) {
        this.texture = this._device.createTexture({
            size: { width, height },
            format: "rgba8unorm",
            usage: GPUTextureUsage.COPY_DST
                | GPUTextureUsage.TEXTURE_BINDING
                | GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.sampler = this._device.createSampler({
            magFilter: "linear",
            minFilter: "linear",
            addressModeU: "repeat",
            addressModeV: "repeat",
        });
    }

    /**
     * Initializes the texture from an image.
     * @param image - The HTMLImageElement object.
     */
    public async initialize(image: HTMLImageElement) {
        this._createTextureAndSampler(image.width, image.height);

        const imageBitmap = await createImageBitmap(image);

        this._device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: this.texture },
            { width: image.width, height: image.height }
        );
    }

    /**
     * Initializes the texture from the data.
     * @param data - The data of the texture as an ArrayBuffer.
     * @param width - The width of the texture.
     * @param height - The height of the texture.
     */
    public async initializeFromData(data: ArrayBuffer, width: number, height: number) {
        this._createTextureAndSampler(width, height);

        this._device.queue.writeTexture(
            { texture: this.texture },
            data,
            {},
            { width, height }
        );
    }
}