import { GeometryBuilder } from "../geometry/GeometryBuilder";
import { GeometryBuffers } from "./GeometryBuffers";

/**
 * The geometry buffers collection.
 * Just a collection of various geometry buffers that can represent a model data.
 * For example a cube, a sphere, a plane etc.
 */
export class GeometryBuffersCollection {

    /**
     * The cube buffers/gemoetry.
     */
    public static cubeBuffers: GeometryBuffers; 

    /**
     * Initializes the geometry buffers.
     * @param device - The GPU device.
     */
    public static intitialize(device: GPUDevice){
        const geometry = new GeometryBuilder().createCubeGeometry();

        this.cubeBuffers = new GeometryBuffers(device, geometry);
    }

}