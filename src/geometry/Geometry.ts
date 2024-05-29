/** 
 * The geometry class.
 */
export class Geometry 
{
    /**
     * The constructor for the geometry.
     */
    constructor(
        /**
         * The positions vertices of the geometry.
         */
        public positions: Float32Array,

        /**
         * The indices into the positions array.
         */
        public indices: Uint16Array = new Uint16Array(),

        /**
         * The colors per vertex.
         */
        public colors: Float32Array = new Float32Array(),

        /**
         * The texture coordinates per vertex.
         */
        public texCoords: Float32Array = new Float32Array(),

        /**
         * The normals per vertex.
         */
        public normals: Float32Array = new Float32Array()
    )
    {}
}