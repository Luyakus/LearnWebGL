import { mat4, vec3, vec4 } from "gl-matrix";
import { BufferItem, UniformItem } from "../../lib/item";
import { cubeVertex, directVertex } from "../cube";
import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";

import objVertSrc from "./obj.vert.glsl";
import objFragSrc from "./obj.frag.glsl";

import lightVertSrc from "./light.vert.glsl";
import lightFragSrc from "./light.frag.glsl";

import { VertexArray } from "../../lib/vertexarray";
import { Camera } from "../../lib/camera";

export function lessonSevenMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;

  let cubeBufferItem = new BufferItem("v_position", 3, cubeVertex);
  let directionBufferItem = new BufferItem("v_normal", 3, directVertex);

  let mMatrix1 = mat4.create();
  let mMatrixItem1 = new UniformItem(
    "m_matrix",
    mMatrix1,
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );

  let lightPosition = vec3.create();
  vec3.set(lightPosition, 1.2, 1.0, 10.0);
  let lightItem = new UniformItem(
    "v_light_position",
    lightPosition,
    (location, value) => {
      gl.uniform3f(location, value[0], value[1], value[2]);
    }
  );

  let mMatrix2 = mat4.create();
  mat4.translate(mMatrix2, mMatrix2, lightPosition);
  mat4.scale(mMatrix2, mMatrix2, vec3.set(vec3.create(), 0.2, 0.2, 0.2));
  let mMatrixItem2 = new UniformItem(
    "m_matrix",
    mMatrix2,
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );

  let vMatrix = mat4.create();
  let vMatrixItem = new UniformItem("v_matrix", vMatrix, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });

  let vMatrix1 = mat4.create();
  let vMatrixItem1 = new UniformItem(
    "v_matrix",
    vMatrix1,
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );

  let pMatrix = mat4.create();
  mat4.perspective(
    pMatrix,
    Math.PI / 4,
    canvas.width / canvas.height,
    0.1,
    100
  );
  let pMatrixItem = new UniformItem("p_matrix", pMatrix, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });

  let objColor = vec3.create();
  vec3.set(objColor, 1, 0.5, 0.31);
  let objColorItem = new UniformItem("obj_color", objColor, gl.uniform3fv);

  let lightColor = vec3.create();
  vec3.set(lightColor, 1, 1, 1);
  let lightColorItem = new UniformItem(
    "light_color",
    lightColor,
    gl.uniform3fv
  );

  let cameraPosition = vec3.create();
  let cameraPositionItem = new UniformItem(
    "v_camera_position",
    cameraPosition,
    gl.uniform3fv
  );

  let program1 = new Program(
    new Shader(objVertSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(objFragSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );

  let program2 = new Program(
    new Shader(lightVertSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(lightFragSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );

  let vao = new VertexArray(cubeVertex.length / 3, gl);

  // 画物体
  cubeBufferItem.attach(vao, program1, gl);
  cubeBufferItem.apply();

  directionBufferItem.attach(vao, program1, gl);
  directionBufferItem.apply();

  mMatrixItem1.attach(vao, program1, gl);
  mMatrixItem1.apply();

  pMatrixItem.attach(vao, program1, gl);
  pMatrixItem.apply();

  objColorItem.attach(vao, program1, gl);
  objColorItem.apply();

  lightColorItem.attach(vao, program1, gl);
  lightColorItem.apply();

  lightItem.attach(vao, program1, gl);
  lightItem.apply();

  cameraPositionItem.attach(vao, program1, gl);

  // 画光源
  cubeBufferItem.attach(vao, program2, gl);
  cubeBufferItem.apply();

  mMatrixItem2.attach(vao, program2, gl);
  mMatrixItem2.apply();

  pMatrixItem.attach(vao, program2, gl);
  pMatrixItem.apply();

  vMatrixItem.attach(vao, program1, gl!);

  let angle = 0;
  let lastime = 0;
  let camera = new Camera(canvas);
  function draw(time: number) {
    camera.move((time - lastime) / 1000);

    let mMatrix = mat4.create();
    mat4.rotate(mMatrix, mMatrix, angle, vec3.set(vec3.create(), 1, 1, 0))
    mMatrixItem1.data = mMatrix;
    mMatrixItem1.apply();



    vMatrixItem.data = camera.cameraMatrix();
    vMatrixItem.apply();

    cameraPositionItem.data = camera.position;
    cameraPositionItem.apply();
    vao.draw(program1);

    vMatrixItem1.attach(vao, program2, gl!);
    vMatrixItem1.data = camera.cameraMatrix();
    vMatrixItem1.apply();
    vao.draw(program2, false);
    lastime = time;
    angle += 0.05
    requestAnimationFrame(draw);
  }
  draw(0);
}
