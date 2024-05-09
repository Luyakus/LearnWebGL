import * as Matrix from "gl-matrix";
import { imageLoader } from "../../lib/imageloader";
import { VertexArray } from "../../lib/vertexarray";
import { cubeVertex, textureVertex } from "./cube";
import { Texture } from "../../lib/texture";
import png1 from "../../assets/1.png";
import png2 from "../../assets/2.png";
import png3 from "../../assets/3.png";

import vertSrc from "./vert.glsl";

import fragSrc from "./frag.glsl";
import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";
import { BufferItem, UniformItem } from "../../lib/item";

Matrix.glMatrix.setMatrixArrayType(Float32Array);

export async function lessonFiveMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;
  let image1 = await imageLoader(png1);
  let image2 = await imageLoader(png2);
  let image3 = await imageLoader(png3);

  let angle = 0;
  let rotateVec3 = Matrix.vec3.create();
  Matrix.vec3.set(rotateVec3, 1, 1, 0);

  let vaos: VertexArray[] = [];
  let programs: Program[] = [];
  let texture1 = new Texture(image1, gl);
  let texture2 = new Texture(image2, gl);
  let texture3 = new Texture(image3, gl);

  let matrixs: UniformItem[] = [];

  let n: 1 | 2 | 3 | 6 = 1;
  let positionStep = 18 * n;
  let coordStep = 12 * n;

  for (let i = 0; i * positionStep < cubeVertex.length; i++) {
    let cubeEnd = positionStep * (i + 1);
    let subCube = cubeVertex.subarray(
      i * positionStep,
      cubeEnd <= cubeVertex.length ? cubeEnd : cubeVertex.length
    );

    let coordEnd = coordStep * (i + 1);
    let subCoord = textureVertex.subarray(
      i * coordStep,
      coordEnd <= textureVertex.length ? coordEnd : textureVertex.length
    );
    let vao = new VertexArray(subCube.length / 3, gl);
    let program = new Program(
      new Shader(vertSrc, gl.VERTEX_SHADER, gl).shader,
      new Shader(fragSrc, gl.FRAGMENT_SHADER, gl).shader,
      gl
    );

    let vertexBuffer = new BufferItem("v_position", 3, subCube);
    let texcoordBuffer = new BufferItem("v_texcoord", 2, subCoord);
    let textureItem = new UniformItem("u_image", i, gl.uniform1i);
    textureItem.attach(vao, program, gl);
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

    let mMat4 = Matrix.mat4.create();

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
    vaos.push(vao);
    programs.push(program);
    matrixs.push(mMatrixItem);
  }

  function draw() {
    angle += 0.05;

    matrixs.forEach((item, index) => {
      let mMat4 = Matrix.mat4.create();
      Matrix.mat4.rotate(mMat4, mMat4, angle, rotateVec3);
      item.data = mMat4;
      item.apply();
      if (index % 3 === 0) {
        //0, 3
        texture1.active(index);
      } else if (index % 3 == 1) {
        // 1, 4
        texture2.active(index);
      } else {
        // 2, 5
        texture3.active(index);
      }
      vaos[index].draw(programs[index], index == 0);
    });
    requestAnimationFrame(draw);
  }
  draw();
}
