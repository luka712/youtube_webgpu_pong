
/**
 * The color class.
 */
export class Color extends Float32Array {

    /**
     * The constructor for the color.
     * @param r The red component. By default, 1.
     * @param g The green component. By default, 1.
     * @param b The blue component. By default, 1.
     * @param a The alpha component. By default, 1.
     */
    constructor(r: number = 1, g: number = 1, b: number = 1, a: number = 1) {
        super(4);

        this[0] = r;
        this[1] = g;
        this[2] = b;
        this[3] = a;
    }

    /**
     * The red component.
     */
    public get r(): number {
        return this[0];
    }

    /**
     * The red component.
     */
    public set r(value: number) {
        this[0] = value;
    }

    /**
     * The green component.
     */
    public get g(): number {
        return this[1];
    }

    /**
     * The green component.
     */
    public set g(value: number) {
        this[1] = value;
    }

    /**
     * The blue component.
     */
    public get b(): number {
        return this[2];
    }

    /**
     * The blue component.
     */
    public set b(value: number) {
        this[2] = value;
    }

    /**
     * The alpha component.
     */
    public get a(): number {
        return this[3];
    }

    /**
     * The alpha component.
     */
    public set a(value: number) {
        this[3] = value;
    }

    /**
     * Creates the red color.
     * @returns A new color with the values of this color.
     */
    public static red(): Color {
        return new Color(1, 0, 0, 1);
    }

    /**
     * Creates the white color.
     * @returns A new color with the values of this color.
     */
    public static white(): Color {
        return new Color(1, 1, 1, 1);
    }
}