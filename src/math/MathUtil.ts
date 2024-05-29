/**
 * The math utility class.
 */
export class MathUtil
{
    /**
     * Converts radians to degrees.
     * @param degrees - The degrees to convert.
     * @returns The degrees in radians.
     */
    public static toRadians(degrees: number): number
    {
        return degrees * Math.PI / 180;
    }
}