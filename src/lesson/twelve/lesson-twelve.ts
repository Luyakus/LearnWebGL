import { mat4, vec3 } from "gl-matrix";
import { BufferItem, UniformItem } from "../../lib/item";
import { cubeVertex, directVertex, textureVertex, cubePosition } from "../cube";
import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";

import objVertSrc from "./obj.vert.glsl";
import objFragSrc from "./obj.frag.glsl";

import { VertexArray } from "../../lib/vertexarray";
import { Camera } from "../../lib/camera";
import { Texture } from "../../lib/texture";

import png1 from "../../assets/4.png";
import png2 from "../../assets/5.png";
import { imageLoader } from "../../lib/imageloader";
import { degreesToRadians } from "../util";

export async function lessonTwelveMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  let image1 = await imageLoader(png1);
  let image2 = await imageLoader(png2);

  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;

  let cubeBufferItem = new BufferItem("v_position", 3, cubeVertex);
  let directionBufferItem = new BufferItem("v_normal", 3, directVertex);
  let texcoordBufferItem = new BufferItem("v_texcoord", 2, textureVertex);

  let mMatrix1 = mat4.create();
  let mMatrixItem1 = new UniformItem(
    "m_matrix",
    mMatrix1,
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );

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

  let cameraPosition = vec3.create();
  let cameraPositionItem = new UniformItem(
    "v_camera_position",
    cameraPosition,
    gl.uniform3fv
  );

  let cameraFront = vec3.create();
  let cameraFrontItem = new UniformItem(
    "v_camera_front",
    cameraFront,
    gl.uniform3fv
  );

  let texture1 = new Texture(image1, gl);
  let texture2 = new Texture(image2, gl);

  let materialDiffItem = new UniformItem("material.diffuse", 1, gl.uniform1i);

  let materialSpecItem = new UniformItem("material.specular", 2, gl.uniform1i);

  let materialShinItem = new UniformItem(
    "material.shininess",
    32,
    gl.uniform1f
  );

  let color = vec3.set(vec3.create(), 0.2, 0.5, 0.3);

  let lightAmbItem = new UniformItem(
    "light.ambient",
    vec3.set(vec3.create(), color[0] * 0.5, color[1] * 0.5, color[2] *0.5),
    gl.uniform3fv
  );

  let lightDiffItem = new UniformItem(
    "light.diffuse",
    vec3.set(vec3.create(), color[0] * 4, color[1] * 4, color[2] * 4),
    gl.uniform3fv
  );

  let lightSpecItem = new UniformItem(
    "light.specular",
    vec3.set(vec3.create(), 1, 1, 1),
    gl.uniform3fv
  );

  let lightConstantItem = new UniformItem("light.constant", 1, gl.uniform1f);

  let lightLinearItem = new UniformItem("light.linear", 0.09, gl.uniform1f);

  let lightQuadraticItem = new UniformItem(
    "light.quadratic",
    0.032,
    gl.uniform1f
  );

  let lightCutOffItem = new UniformItem(
    "light.cutOff",
    Math.cos(degreesToRadians(12.5)),
    gl.uniform1f
  );

  let lightOutCutOffItem = new UniformItem(
    "light.outCutOff",
    Math.cos(degreesToRadians(17.5)),
    gl.uniform1f
  );


  let program1 = new Program(
    new Shader(objVertSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(objFragSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );

  let vao = new VertexArray(cubeVertex.length / 3, gl);

  // 画物体, 固定值
  [
    cubeBufferItem,
    directionBufferItem,
    texcoordBufferItem,
    pMatrixItem,
    materialDiffItem,
    materialSpecItem,
    materialShinItem,
    lightAmbItem,
    lightDiffItem,
    lightSpecItem,
    lightConstantItem,
    lightLinearItem,
    lightQuadraticItem,
    lightCutOffItem,
    lightOutCutOffItem
  ].forEach((item) => {
    item.attach(vao, program1, gl);
    item.apply();
  });

  // 动态值
  cameraPositionItem.attach(vao, program1, gl);
  cameraFrontItem.attach(vao, program1, gl);
  mMatrixItem1.attach(vao, program1, gl);
  vMatrixItem1.attach(vao, program1, gl);

  let angle = 0;
  let lastime = 0;
  let camera = new Camera(canvas);
  function draw(time: number) {
    camera.move((time - lastime) / 1000);

    vMatrixItem1.data = camera.cameraMatrix();
    vMatrixItem1.apply();

    cameraPositionItem.data = camera.position;
    cameraPositionItem.apply();

    cameraFrontItem.data = camera.front;
    cameraFrontItem.apply();

    texture1.active(1);
    texture2.active(2);

    cubePosition.forEach((position, index) => {
      let mMatrix = mat4.create();
    //   mat4.rotate()
      mat4.translate(mMatrix, mMatrix, position);
      mat4.rotate(mMatrix, mMatrix, angle * (index + 0), vec3.set(vec3.create(), 1, 1, 0));
      mMatrixItem1.data = mMatrix;
      mMatrixItem1.apply();
      vao.draw(program1, index == 0);
    });
    lastime = time;
    angle += 0.01;
    requestAnimationFrame(draw);
  }
  draw(0);
}
