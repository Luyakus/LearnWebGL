import { BufferItem, UniformItem } from "../../lib/item";
import { VertexArray } from "../../lib/vertexarray";
import { Shader } from "../../lib/shader";
import { mat4, vec3 } from "gl-matrix";
import { degreesToRadians } from "../util";
import {
  cubeVertex,
  floorTextureVertex,
  floorVertex,
  cubeTextureVertex,
  grassVertex,
  grassTextureVertex,
  grassPosition,
  widowPosition,
} from "../cube";
import { imageLoader } from "../../lib/imageloader";
import { Texture } from "../../lib/texture";
import { Program } from "../../lib/program";
import verSrc from "./vert.glsl";
import fragSrc from "./frag.glsl";
import grass from "../../assets/grass.png";
import floor from "../../assets/floor.png";
import wall from "../../assets/wall.png";
import window from "../../assets/window.png";

export async function lessonFifteenMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;
  let grassImage = await imageLoader(grass);
  let wallImage = await imageLoader(wall);
  let floorImage = await imageLoader(floor);
  let windowImage = await imageLoader(window);
  let eyePosition = vec3.set(vec3.create(), -2, 1, 10);
  let program = new Program(
    new Shader(verSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(fragSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );

  let mMatrixItem = new UniformItem(
    "m_matrix",
    mat4.create(),
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );

  let vMatrix = mat4.create();
  mat4.lookAt(
    vMatrix,
    eyePosition,
    vec3.create(),
    vec3.set(vec3.create(), 0, 1, 0)
  );
  let vMatrixItem = new UniformItem("v_matrix", vMatrix, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });

  let pMatrix = mat4.create();
  mat4.perspective(
    pMatrix,
    degreesToRadians(45),
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  let pMatrixItem = new UniformItem("p_matrix", pMatrix, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });

  let floorVao = new VertexArray(floorVertex.length / 3, gl);
  let floorBufferItem = new BufferItem("v_position", 3, floorVertex);
  let floorTexcoordBufferItem = new BufferItem(
    "v_texcoord",
    2,
    floorTextureVertex
  );
  let floorTextureItem = new UniformItem("texture0", 0, gl.uniform1i);
  [
    floorBufferItem,
    floorTexcoordBufferItem,
    floorTextureItem,
    mMatrixItem,
    vMatrixItem,
    pMatrixItem,
  ].forEach((item) => {
    item.attach(floorVao, program, gl);
    item.apply();
  });

  let floorTexure = new Texture(floorImage, gl);
  floorTexure.active(0);
  floorVao.draw({ program, clear: true });

  let boxVao = new VertexArray(cubeVertex.length / 3, gl);
  let boxBufferItem = new BufferItem("v_position", 3, cubeVertex);
  let boxTexcoordBufferItem = new BufferItem(
    "v_texcoord",
    2,
    cubeTextureVertex
  );
  let boxTextureItem = new UniformItem("texture0", 0, gl.uniform1i);
  [
    boxBufferItem,
    boxTexcoordBufferItem,
    boxTextureItem,
    mMatrixItem,
    vMatrixItem,
    pMatrixItem,
  ].forEach((item) => {
    item.attach(boxVao, program, gl);
    item.apply();
  });
  let boxMarix = mat4.create();
  mMatrixItem.data = mat4.translate(
    boxMarix,
    boxMarix,
    vec3.set(vec3.create(), -2.0, 0.0, -3.0)
  );
  mMatrixItem.apply();
  let boxTexure = new Texture(wallImage, gl);
  boxTexure.active(0);

  boxVao.draw({ program, clear: false });
  boxMarix = mat4.create();
  mMatrixItem.data = mat4.translate(
    boxMarix,
    boxMarix,
    vec3.set(vec3.create(), 0.5, 0.0, 0)
  );
  mMatrixItem.apply();
  boxVao.draw({ program, clear: false });

  let grassVao = new VertexArray(grassVertex.length / 3, gl);
  let grassBufferItem = new BufferItem("v_position", 3, grassVertex);
  let grassTexcoordBufferItem = new BufferItem(
    "v_texcoord",
    2,
    grassTextureVertex
  );
  let grassTextureItem = new UniformItem("texture0", 0, gl.uniform1i);
  [
    grassBufferItem,
    grassTexcoordBufferItem,
    grassTextureItem,
    mMatrixItem,
    vMatrixItem,
    pMatrixItem,
  ].forEach((item) => {
    item.attach(grassVao, program, gl);
    item.apply();
  });
  let grassTexure = new Texture(grassImage, gl);
  grassTexure.active(0);

  grassPosition.forEach((p) => {
    let grassMarix = mat4.create();
    mMatrixItem.data = mat4.translate(grassMarix, grassMarix, p);
    mMatrixItem.apply();
    grassVao.draw({
      program,
      clear: false,
      glConfig: () => {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      },
    });
  });

  let windowVao = new VertexArray(grassVertex.length / 3, gl);
  let windowBufferItem = new BufferItem("v_position", 3, grassVertex);
  let windowTexcoordBufferItem = new BufferItem(
    "v_texcoord",
    2,
    grassTextureVertex
  );
  let windowTextureItem = new UniformItem("texture0", 0, gl.uniform1i);
  [
    windowBufferItem,
    windowTexcoordBufferItem,
    windowTextureItem,
    mMatrixItem,
    vMatrixItem,
    pMatrixItem,
  ].forEach((item) => {
    item.attach(windowVao, program, gl);
    item.apply();
  });
  let windowTexure = new Texture(windowImage, gl);
  windowTexure.active(0);

  interface Position {
    type: string
    position: vec3;
  }

  let positions: Position[] = widowPosition
    .map((p) => {
      return { type: "window", position: p } ;
    })
    .concat(
      grassPosition.map((p) => {
        return { type: "grass", position: p };
      })
    )
    .sort((a, b) => {
      return (
        vec3.distance(eyePosition, b.position) -
        vec3.distance(eyePosition, a.position)
      );
    });

  positions.forEach((p) => {
    let mMarix = mat4.create();
    if (p.type === "window") {
      mMatrixItem.data = mat4.translate(mMarix, mMarix, p.position);
      mMatrixItem.attach(windowVao, program, gl);
      mMatrixItem.apply();
      windowVao.draw({
        program,
        clear: false,
        glConfig: () => {
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        },
      });
    } else {
      mMatrixItem.data = mat4.translate(mMarix, mMarix, p.position);
      mMatrixItem.attach(grassVao, program, gl);
      mMatrixItem.apply();
      grassVao.draw({
        program,
        clear: false,
        glConfig: () => {
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        },
      });
    }
  });
}
