import png1 from "../../assets/4.png";
import png2 from "../../assets/5.png";
import { imageLoader } from "../../lib/imageloader";
import { BufferItem, StructUniformItem, UniformItem } from "../../lib/item";
import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";

import objVertSrc from "./obj.vert.glsl";
import objFragSrc from "./obj.frag.glsl";
import lightVertSrc from "./light.vert.glsl";
import lightFragSrc from "./light.frag.glsl";

import {
  cubeVertex,
  cubeTextureVertex,
  cubeDirectVertex,
  cubePosition,
  lightPosition,
} from "../cube";
import { Texture } from "../../lib/texture";
import { mat4, vec3 } from "gl-matrix";
import { VertexArray } from "../../lib/vertexarray";
import { Camera } from "../../lib/camera";
import { degreesToRadians } from "../util";

export async function lessonThirteenMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;

  let image1 = await imageLoader(png1);
  let image2 = await imageLoader(png2);

  let vao = new VertexArray(cubeVertex.length / 3, gl);
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

  let cubeItem = new BufferItem("v_position", 3, cubeVertex);
  let texcoordItem = new BufferItem("v_texcoord", 2, cubeTextureVertex);
  let normalItem = new BufferItem("v_normal", 3, cubeDirectVertex);

  let texture1 = new Texture(image1, gl);
  let texture2 = new Texture(image2, gl);

  let materialItem = new StructUniformItem("material", [
    new UniformItem(".diffuse", 0, gl.uniform1i),
    new UniformItem(".specular", 1, gl.uniform1i),
    new UniformItem(".shininess", 32, gl.uniform1f),
  ]);

  let mMatrixItem = new UniformItem(
    "m_matrix",
    mat4.create(),
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );

  let vMatrixItem = new UniformItem(
    "v_matrix",
    mat4.create(),
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );

  let pMatrix = mat4.create();
  mat4.perspective(
    pMatrix,
    Math.PI / 4,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  let pMatrixItem = new UniformItem("p_matrix", pMatrix, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });

  let colors: vec3[] = [];
  let createColor = () => {
    return vec3.set(
      vec3.create(),
      Math.random() > 0.5 ? 1 : 0,
      Math.random(),
      Math.random() > 0.5 ? 1 : 0
    );
  };

  lightPosition.forEach((position, index) => {
    let color = createColor();
    colors.push(color);
    let pointLightItem = new StructUniformItem("point_lights", [
      new UniformItem(`[${index}].position`, position, gl.uniform3fv),
      new UniformItem(
        `[${index}].ambient`,
        color.map((c) => c * 0.1),
        gl.uniform3fv
      ),
      new UniformItem(
        `[${index}].diffuse`,
        color.map((c) => c * 0.5),
        gl.uniform3fv
      ),
      new UniformItem(
        `[${index}].specular`,
        color.map((c) => c * 0.9),
        gl.uniform3fv
      ),
      new UniformItem(`[${index}].constant`, 1.0, gl.uniform1f),
      new UniformItem(`[${index}].linear`, 0.09, gl.uniform1f),
      new UniformItem(`[${index}].quadratic`, 0.032, gl.uniform1f),
    ]);
    pointLightItem.attach(vao, program1, gl);
    pointLightItem.apply();
  });

  let lightColorItem = new UniformItem(
    "light_color",
    vec3.create(),
    gl.uniform3fv
  );

  let directionLightItem = new StructUniformItem("direction_light", [
    new UniformItem(
      `.direction`,
      vec3.set(vec3.create(), -1, -1, -1),
      gl.uniform3fv
    ),
    new UniformItem(
      `.ambient`,
      vec3.set(vec3.create(), 0.04, 0.04, 0.04),
      gl.uniform3fv
    ),
    new UniformItem(
      `.diffuse`,
      vec3.set(vec3.create(), 0.3, 0.3, 0.3),
      gl.uniform3fv
    ),
    new UniformItem(
      `.specular`,
      vec3.set(vec3.create(), 1, 1, 1),
      gl.uniform3fv
    ),
  ]);

  let spotLightItem = new StructUniformItem("spot_light", [
    new UniformItem(
      `.ambient`,
      vec3.set(vec3.create(), 0.0, 0.0, 0.0),
      gl.uniform3fv
    ),
    new UniformItem(
      `.diffuse`,
      vec3.set(vec3.create(), 1, 1, 1),
      gl.uniform3fv
    ),
    new UniformItem(
      `.specular`,
      vec3.set(vec3.create(), 1, 1, 1),
      gl.uniform3fv
    ),
    new UniformItem(`.constant`, 1.0, gl.uniform1f),
    new UniformItem(`.linear`, 0.0014, gl.uniform1f),
    new UniformItem(`.quadratic`, 0.000007, gl.uniform1f),
    new UniformItem(`.cutOff`, Math.cos(degreesToRadians(5.5)), gl.uniform1f),
    new UniformItem(
      `.outCutOff`,
      Math.cos(degreesToRadians(10.0)),
      gl.uniform1f
    ),
  ]);

  [
    cubeItem,
    texcoordItem,
    normalItem,
    pMatrixItem,
    materialItem,
    directionLightItem,
    spotLightItem,
  ].forEach((item) => {
    item.attach(vao, program1, gl);
    item.apply();
  });

  [cubeItem, pMatrixItem].forEach((item) => {
    item.attach(vao, program2, gl);
    item.apply();
  });

  texture1.active(0);
  texture2.active(1);

  let camera = new Camera(canvas);

  let cameraPositionItem = new UniformItem(
    "camera_position",
    camera.position,
    gl.uniform3fv
  );

  let cameraDirectionItem = new UniformItem(
    "camera_direction",
    camera.position,
    gl.uniform3fv
  );
  cameraPositionItem.attach(vao, program1, gl);
  cameraDirectionItem.attach(vao, program1, gl);

  let lastime = 0;
  let angle = 0;
  function draw(time: number) {
    camera.move((time - lastime) / 1000);

    cameraPositionItem.data = camera.position;
    cameraPositionItem.apply();

    cameraDirectionItem.data = camera.front;
    cameraDirectionItem.apply();

    vMatrixItem.data = camera.cameraMatrix();
    vMatrixItem.attach(vao, program1, gl!);
    vMatrixItem.apply();

    cubePosition.forEach((position, index) => {
      let mMatrix = mat4.create();
      mat4.translate(mMatrix, mMatrix, position);
      mat4.rotate(
        mMatrix,
        mMatrix,
        angle,
        vec3.set(
          vec3.create(),
          position[0] || 1,
          position[1] || 1,
          position[2] || 1
        )
      );
      mMatrixItem.data = mMatrix;
      mMatrixItem.attach(vao, program1, gl!);
      mMatrixItem.apply();
      vao.draw({ program: program1, clear: index === 0 });
    });

    vMatrixItem.attach(vao, program2, gl!);
    vMatrixItem.apply();

    lightPosition.forEach((position, index) => {
      let mMatrix = mat4.create();
      mat4.translate(mMatrix, mMatrix, position);
      mat4.scale(mMatrix, mMatrix, vec3.set(vec3.create(), 0.4, 0.4, 0.4));

      mMatrixItem.data = mMatrix;
      mMatrixItem.attach(vao, program2, gl!);
      mMatrixItem.apply();

      lightColorItem.attach(vao, program2, gl!);
      lightColorItem.data = colors[index];
      lightColorItem.apply();
      vao.draw({ program: program2, clear: false });
    });
    angle += 0.01;
    lastime = time;
    requestAnimationFrame(draw);
  }

  draw(0);
}
