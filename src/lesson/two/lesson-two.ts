import { createProgram, createShader } from "../util";
import vertexShaderSource from "./vert.glsl";
import fragmentShaderSource from "./frag.glsl";
import png from "../../assets/1.png";

export function lessonTwoMain(canvas: HTMLCanvasElement) {
  let image = new Image();
  image.src = png;
  image.onload = () => {
    let gl = canvas.getContext("webgl2");
    if (!gl) {
      console.log("获取 webgl 失败");
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
    let fragmentShaderResult = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!fragmentShaderResult.result) {
      console.log(fragmentShaderResult.message);
      return;
    }
    let vertexShader = vertexShaderResult.data!;
    let framentShader = fragmentShaderResult.data!;
    let programResult = createProgram(gl, vertexShader, framentShader);
    if (!programResult.result) {
      console.log(programResult.message);
      return;
    }
    gl.canvas.width = canvas.clientWidth * 4;
    gl.canvas.height = canvas.clientHeight * 4;
    let program = programResult.data!;
    let aPositionLocation = gl.getAttribLocation(program, "a_position");
    let aTexCoordLocaiton = gl.getAttribLocation(program, "a_texCoord");
    let uImageLocation = gl.getUniformLocation(program, "u_image");

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    let imageVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, imageVertexBuffer);
    gl.enableVertexAttribArray(aTexCoordLocaiton);
    gl.vertexAttribPointer(aTexCoordLocaiton, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(aPositionLocation);
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5,
      ]),
      gl.STATIC_DRAW
    );
    gl.bindVertexArray(null);

    gl.useProgram(program);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.uniform1i(uImageLocation, 0);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0.2, 0.3, 1);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
}
