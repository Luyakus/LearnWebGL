export async function fileLoader(path: string) {
  try {
    let response = await fetch(path);
    return response;
  } catch (e) {
    console.log(e);
    return undefined
  }
}
