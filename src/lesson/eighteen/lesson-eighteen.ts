import { mat4 } from "gl-matrix";

export function lessonEighteenMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;
  let matrix = mat4.create();
  console.log(matrix);
}
