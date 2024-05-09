export async function imageLoader(
  src: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.src = src;
    image.onload = () => {
      resolve(image);
    };
    image.onerror = (e) => {
      reject(new Error(`${src} 加载失败`));
    };
  });
}
