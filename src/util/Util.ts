export class Util {
    public static async loadImage(path: string): Promise<HTMLImageElement> {

        return new Promise((resolve, reject) => {

            const image = new Image();
            image.src = path;
            image.onload = () => resolve(image);
            image.onerror = reject;

        });
    }
}