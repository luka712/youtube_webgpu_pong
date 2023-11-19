export class Color  extends Float32Array
{
    constructor(r: number = 1, g: number = 1, b: number = 1, a: number = 1)
    {
        super(4);   

        this[0] = r;
        this[1] = g;
        this[2] = b;
        this[3] = a;
    }

    public get r(): number
    {
        return this[0];
    }

    public set r(value: number)
    {
        this[0] = value;
    }

    public get g(): number
    {
        return this[1];
    }

    public set g(value: number)
    {
        this[1] = value;
    }

    public get b(): number
    {
        return this[2];
    }

    public set b(value: number)
    {
        this[2] = value;
    }

    public get a(): number
    {
        return this[3];
    }

    public set a(value: number)
    {
        this[3] = value;
    }

    public static red(): Color 
    {
        return new Color(1, 0, 0, 1);
    }

    public static white(): Color 
    {
        return new Color(1, 1, 1, 1);
    }
}