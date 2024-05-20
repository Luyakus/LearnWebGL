import { mat4, vec3 } from "gl-matrix";
import { BufferItem, UniformItem } from "../../lib/item";
import {
  cubeVertex,
  cubeDirectVertex,
  cubeTextureVertex,
  cubePosition,
} from "../cube";
import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";

import objVertSrc from "./obj.vert.glsl";
import objFragSrc from "./obj.frag.glsl";

import lightVertSrc from "./light.vert.glsl";
import lightFragSrc from "./light.frag.glsl";

import { VertexArray } from "../../lib/vertexarray";
import { Camera } from "../../lib/camera";
import { Texture } from "../../lib/texture";

import png1 from "../../assets/4.png";
import png2 from "../../assets/5.png";
import { imageLoader } from "../../lib/imageloader";
export async function lessonElevenMain(canvas: HTMLCanvasElement) {
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
  let directionBufferItem = new BufferItem("v_normal", 3, cubeDirectVertex);
  let texcoordBufferItem = new BufferItem("v_texcoord", 2, cubeTextureVertex);

  let mMatrix1 = mat4.create();
  let mMatrixItem1 = new UniformItem(
    "m_matrix",
    mMatrix1,
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );

  let lightPosition = vec3.create();
  vec3.set(lightPosition, 0, 1, 3);
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

  let vMatrix1 = mat4.create();
  let vMatrixItem1 = new UniformItem(
    "v_matrix",
    vMatrix1,
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );

  let vMatrix2 = mat4.create();
  let vMatrixItem2 = new UniformItem(
    "v_matrix",
    vMatrix2,
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

  let texture1 = new Texture(image1, gl);
  let texture2 = new Texture(image2, gl);

  let materialDiffItem = new UniformItem("material.diffuse", 1, gl.uniform1i);

  let materialSpecItem = new UniformItem("material.specular", 2, gl.uniform1i);

  let materialShinItem = new UniformItem(
    "material.shininess",
    256,
    gl.uniform1f
  );

  let color = vec3.set(vec3.create(), 0.7, 0.5, 0.5);

  let lightAmbItem = new UniformItem(
    "light.ambient",
    vec3.set(vec3.create(), color[0] * 0.2, color[1] * 0.2, color[2] * 0.2),
    gl.uniform3fv
  );

  let lightDiffItem = new UniformItem(
    "light.diffuse",
    vec3.set(vec3.create(), color[0] * 0.8, color[1] * 0.8, color[2] * 0.8),
    gl.uniform3fv
  );

  let lightSpecItem = new UniformItem(
    "light.specular",
    vec3.set(vec3.create(), 1, 1, 1),
    gl.uniform3fv
  );

  let lightColorItem = new UniformItem("light_color", color, gl.uniform3fv);

  let lightConstantItem = new UniformItem("light.constant", 1, gl.uniform1f);

  let lightLinearItem = new UniformItem("light.linear", 0.09, gl.uniform1f);

  let lightQuadraticItem = new UniformItem(
    "light.quadratic",
    0.02,
    gl.uniform1f
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

  texcoordBufferItem.attach(vao, program1, gl);
  texcoordBufferItem.apply();

  mMatrixItem1.attach(vao, program1, gl);
  mMatrixItem1.apply();

  pMatrixItem.attach(vao, program1, gl);
  pMatrixItem.apply();

  lightItem.attach(vao, program1, gl);
  lightItem.apply();

  [
    materialDiffItem,
    materialSpecItem,
    materialShinItem,
    lightAmbItem,
    lightDiffItem,
    lightSpecItem,
    lightConstantItem,
    lightLinearItem,
    lightQuadraticItem,
  ].forEach((item) => {
    item.attach(vao, program1, gl);
    item.apply();
  });

  cameraPositionItem.attach(vao, program1, gl);
  // 画光源
  cubeBufferItem.attach(vao, program2, gl);
  cubeBufferItem.apply();

  mMatrixItem2.attach(vao, program2, gl);
  mMatrixItem2.apply();

  pMatrixItem.attach(vao, program2, gl);
  pMatrixItem.apply();

  lightColorItem.attach(vao, program2, gl!);
  lightColorItem.apply();

  vMatrixItem1.attach(vao, program1, gl!);

  let angle = 0;
  let lastime = 0;
  let camera = new Camera(canvas);
  function draw(time: number) {
    camera.move((time - lastime) / 1000);

    vMatrixItem2.attach(vao, program2, gl!);
    vMatrixItem2.data = camera.cameraMatrix();
    vMatrixItem2.apply();
    vao.draw({ program: program2, clear: true });
    // return;
    vMatrixItem1.data = camera.cameraMatrix();
    vMatrixItem1.apply();
    cameraPositionItem.data = camera.position;
    cameraPositionItem.apply();
    texture1.active(1);
    texture2.active(2);

    cubePosition.forEach((position, index) => {
      let mMatrix = mat4.create();
      mat4.translate(mMatrix, mMatrix, position);
      mat4.rotate(
        mMatrix,
        mMatrix,
        angle * index,
        vec3.set(vec3.create(), 1, 1, 0)
      );
      mMatrixItem1.data = mMatrix;
      mMatrixItem1.apply();
      vao.draw({ program: program1, clear: false });
    });
    lastime = time;
    angle += 0.01;
    requestAnimationFrame(draw);
  }
  draw(0);
}
