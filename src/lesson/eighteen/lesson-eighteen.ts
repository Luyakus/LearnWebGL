import daePath from "../../assets/vampire/dancing_vampire.dae"
import { mat4 } from "gl-matrix";
import { modelLoader } from "../../lib/modelloader";

export async function lessonEighteenMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;
  let attris =  await modelLoader(daePath);
  console.log(attris);
}
