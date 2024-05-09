import * as Matrix from "gl-matrix";
import { imageLoader } from "../../lib/imageloader";
import { VertexArray } from "../../lib/vertexarray";
import { cubeVertex, textureVertex } from "./cube";
import { Texture } from "../../lib/texture";
import png from "../../assets/1.png";
import vertSrc from "./vert.glsl";
import fragSrc from "./frag.glsl";
import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";
import { BufferItem, TextureItem, UniformItem } from "../../lib/item";

Matrix.glMatrix.setMatrixArrayType(Float32Array);

export async function lessonFiveMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;
  let image = await imageLoader(png);

  let vao = new VertexArray(cubeVertex.length / 3, gl);
  let program = new Program(
    new Shader(vertSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(fragSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );

  let vertexBuffer = new BufferItem("v_position", 3, cubeVertex);
  let texcoordBuffer = new BufferItem("v_texcoord", 2, textureVertex);
  let textureItem = new TextureItem("u_image", 0, new Texture(image, gl));

  let viewMat4 = Matrix.mat4.create();
  let vec3 = Matrix.vec3.create();
  Matrix.vec3.set(vec3, 0, 0, -3);
  Matrix.mat4.translate(viewMat4, viewMat4, vec3);

  let projectMat4 = Matrix.mat4.create();
  Matrix.mat4.perspective(
    projectMat4,
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );

  let pvMat4 = Matrix.mat4.create();
  Matrix.mat4.multiply(pvMat4, projectMat4, viewMat4);
  let pvMatrixItem = new UniformItem("pv_mat4", pvMat4, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });

  let angle = 0;
  let mMat4 = Matrix.mat4.create();
  let rotateVec3 = Matrix.vec3.create();
  Matrix.vec3.set(rotateVec3, 1, 1, 1);
  Matrix.mat4.rotate(mMat4, mMat4, angle, rotateVec3);
  let mMatrixItem = new UniformItem("m_mat4", mMat4, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });

  [
    vertexBuffer,
    texcoordBuffer,
    textureItem,
    pvMatrixItem,
    mMatrixItem,
  ].forEach((item) => {
    item.attach(vao, program, gl);
    item.apply();
  });

  function draw() {
    angle += 0.1;
    let mMat4 = Matrix.mat4.create();
    Matrix.mat4.rotate(mMat4, mMat4, angle, rotateVec3);
    mMatrixItem.data = mMat4;
    mMatrixItem.apply();
    vao.draw(program);
    requestAnimationFrame(draw);
  }

  draw();
}
