
/**
 * The 2D vector class.
 */
export class Vec2 extends Float32Array {
    
    /**
     * The constructor for the 2D vector.
     * @param x - The x component. By default, 0.
     * @param y - The y component. By default, 0.
     */
    constructor(x: number = 0, y: number = 0) {
        super(2);

        this[0] = x;
        this[1] = y;
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
     * Normalizes the vector. Sets the length to 1.
     */
    public normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y);
        this.x /= length;
        this.y /= length;
    }
}