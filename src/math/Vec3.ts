/**
 * The 3D vector class.
 */
export class Vec3 extends Float32Array {
    /**
     * The constructor for the 3D vector.
     * @param x - The x component. By default, 0.
     * @param y - The y component. By default, 0.
     * @param z - The z component. By default, 0.
     */
    constructor(x: number = 0, y: number = 0, z: number = 0) {
        super(3);

        this[0] = x;
        this[1] = y;
        this[2] = z;
    }

    /**
       * The x component.
       */
    public get x(): number {
        return this[0];
    }

    /**
     * The x component.
     */
    public set x(value: number) {
        this[0] = value;
    }

    /**
     * The y component.
     */
    public get y(): number {
        return this[1];
    }

    /**
     * The y component.
     */
    public set y(value: number) {
        this[1] = value;
    }

    /**
     * The z component.
     */
    public get z(): number {
        return this[2];
    }

    /**
     * The z component.
     */
    public set z(value: number) {
        this[2] = value;
    }

    /**
     * Returns the length of the vector.
     * @param v - The vector.
     * @returns The length of the vector.
     */
    public static length(v: Vec3): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    /**
     * Subtracts vector b from vector a.
     * @param a - The first vector.
     * @param b - The second vector.
     * @returns The result of the subtraction.
     */
    public static subtract(a: Vec3, b: Vec3): Vec3 {
        return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    /**
     * Normalizes the vector.
     * @param v - The vector to normalize.
     * @returns The normalized vector.
     */
    public static normalize(v: Vec3): Vec3 {
        const length = Vec3.length(v);
        return new Vec3(v.x / length, v.y / length, v.z / length);
    }

    /**
     * Computes the cross product of two vectors.
     * @param a - The first vector.
     * @param b - The second vector.
     * @returns The cross product of the two vectors.
     */
    public static cross(a: Vec3, b: Vec3): Vec3 {
        return new Vec3(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }

    /**
     * The dot product of two vectors.
     * @param a - The first vector.
     * @param b - The second vector.
     * @returns The dot product of the two vectors.
     */
    public static dot(a: Vec3, b: Vec3): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

}