import { Geometry } from "../geometry/Geometry";

/**
 * The memory buffer for passing to the GPU.
 * Contains various data about the geometry, such as positions, colors, texture coordinates etc.
 */
export class GeometryBuffers 
{
    // - BUFFER WITH DATA
    /**
     * The buffer with positions (x,y,z) of a model. 
     */
    public readonly positionsBuffer: GPUBuffer;

    /**
     * The buffer with indices of a model. Lookup data for positions.
     */
    public readonly indicesBuffer?: GPUBuffer;

    /**
     * The buffer with colors of a model.
     */
    public readonly colorsBuffer: GPUBuffer;

    /**
     * The buffer with texture coordinates of a model.
     */
    public readonly texCoordsBuffer: GPUBuffer;

    /**
     * The buffer with normals of a model.
     */
    public readonly normalsBuffer: GPUBuffer;

    // - NUMBER OF ITEMS TO DRAW
    /**
     * The number of vertices to draw.
     */
    public readonly vertexCount: number;

    /**
     * The number of indices to draw.
     */
    public readonly indexCount?: number;

    /**
     * The constructor
     * @param device - The GPU device.
     * @param geometry - The geometry.
     */
    constructor(device: GPUDevice, geometry: Geometry) 
    {
        // - POSITIONS
        this.positionsBuffer = device.createBuffer({
            label: "Positions Buffer",
            size: geometry.positions.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST 
        });

        device.queue.writeBuffer(this.positionsBuffer, 
            0, 
            geometry.positions.buffer, 
            0, 
            geometry.positions.byteLength);

        this.vertexCount = geometry.positions.length / 3; // (xyz)


        // - INDICES
        if (geometry.indices.length > 0) 
        {
            this.indicesBuffer = device.createBuffer({
                label: "Indices Buffer",
                size: geometry.indices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
            });

            device.queue.writeBuffer(this.indicesBuffer,
                0,
                geometry.indices.buffer,
                0,
                geometry.indices.byteLength);

            this.indexCount = geometry.indices.length;
        }
    
        // - COLORS
        this.colorsBuffer = device.createBuffer({
            label: "Colors Buffer",
            size: geometry.colors.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(this.colorsBuffer,
            0,
            geometry.colors.buffer,
            0,
            geometry.colors.byteLength);

        // - TEXCOORDS
        this.texCoordsBuffer = device.createBuffer({
            label: "TexCoords Buffer",
            size: geometry.texCoords.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(this.texCoordsBuffer,
            0,
            geometry.texCoords.buffer,
            0,
            geometry.texCoords.byteLength);

        // - NORMALS
        this.normalsBuffer = device.createBuffer({
            label: "Normals Buffer",
            size: geometry.normals.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(this.normalsBuffer,
            0,
            geometry.normals.buffer,
            0,
            geometry.normals.byteLength);
    }
}