import { createShader, createProgram } from "../util";
import vertexShaderSource from "./vert.glsl";
import fragmentShaderSource from "./frag.glsl";

export function lessonOneMain(canvas: HTMLCanvasElement) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl context 失败");
    return;
  }
  let vertexShaderResult = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
  );
  if (!vertexShaderResult.result) {
    console.log(vertexShaderResult.message);
    return;
  }
  let vertexShader = vertexShaderResult.data!;

  let fragmentShaderResult = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  if (!fragmentShaderResult.result) {
    console.log(vertexShaderResult.message);
    return;
  }
  let fragmentShader = fragmentShaderResult.data!;

  let programResult = createProgram(gl, vertexShader, fragmentShader);
  if (!programResult.result) {
    console.log(programResult.message);
    return;
  }
  let program = programResult.data!;

  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );
  let colorUniformLocation = gl.getUniformLocation(program, "u_color");
  gl.useProgram(program);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  let vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  let positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  gl.clearColor(0, 0.2, 0.3, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  for (let i = 0; i < 50; i++) {
    gl.uniform4f(
      colorUniformLocation,
      randomInt(255) / 255.0,
      randomInt(255) / 255.0,
      randomInt(255) / 255.0,
      1
    );
    setRectangle(
      gl,
      randomInt(300),
      randomInt(300),
      randomInt(300),
      randomInt(300)
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

function randomInt(range: number) {
  return Math.floor(Math.random() * range);
}

function setRectangle(
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number
) {
  let x1 = x;
  let x2 = x + width;
  let y1 = y;
  let y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
}
