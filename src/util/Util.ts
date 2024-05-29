/**
 * The utility class.
 */
export class Util {
   
    /**
     * Load an image from the path.
     * @param path - The path to the image.
     * @returns The HTMLImageElement object.
     */
    public static async loadImage(path: string): Promise<HTMLImageElement> {

        return new Promise((resolve, reject) => {

            const image = new Image();
            image.src = path;
            image.onload = () => resolve(image);
            image.onerror = reject;

        });
    }
}