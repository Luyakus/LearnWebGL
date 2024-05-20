import { BufferItem, UniformItem } from "../../lib/item";
import { VertexArray } from "../../lib/vertexarray";
import { cubeVertex, cubeTextureVertex } from "../cube";
import png from "../../assets/1.png";
import { imageLoader } from "../../lib/imageloader";
import { Texture } from "../../lib/texture";
import vertSrc from "./vert.glsl";
import fragSrc from "./frag.glsl";
import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";
import { mat4, vec3 } from "gl-matrix";
import { Camera } from "../../lib/camera";

export async function lessonSixMain(canvas: HTMLCanvasElement) {
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

  let mMatrix = mat4.create();
  mat4.rotate(mMatrix, mMatrix, Math.PI / 2, vec3.set(vec3.create(), 0, 1, 9));

  let mMatrix1 = mat4.create();
  mat4.translate(mMatrix1, mMatrix1, vec3.set(vec3.create(), 3, 0.5, 0));

  let mMatrix2 = mat4.create();
  mat4.translate(mMatrix2, mMatrix2, vec3.set(vec3.create(), 0, 1, 0));

  let vMatrix = mat4.create();
  mat4.translate(vMatrix, vMatrix, vec3.set(vec3.create(), 0, 0, -3));

  let pMatrix = mat4.create();
  mat4.perspective(
    pMatrix,
    Math.PI / 4,
    canvas.width / canvas.height,
    0.1,
    100
  );

  let mMatrixItem = new UniformItem("m_matrix", mMatrix, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });
  mMatrixItem.attach(vao, program, gl);

  let mMatrixItem1 = new UniformItem(
    "m_matrix",
    mMatrix1,
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );
  mMatrixItem1.attach(vao, program, gl);

  let mMatrixItem2 = new UniformItem(
    "m_matrix",
    mMatrix2,
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );
  mMatrixItem2.attach(vao, program, gl);

  let vMatrixItem = new UniformItem("v_matrix", vMatrix, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });
  vMatrixItem.attach(vao, program, gl);
  let pMatrixItem = new UniformItem("p_matrix", pMatrix, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });

  [
    new BufferItem(
      "v_position",
      3,
      cubeVertex.map((value) => value * 0.3)
    ),
    new BufferItem("v_texcoord", 2, cubeTextureVertex),
    new UniformItem("u_image", 0, gl.uniform1i),
    pMatrixItem,
  ].forEach((item) => {
    item.attach(vao, program, gl);
    item.apply();
  });
  let texture = new Texture(image, gl);
  texture.active(0);

  let lastime = 0;
  let camera = new Camera(canvas);
  function draw(time: number) {
    camera.move((time - lastime) / 1000);
    vMatrixItem.data = camera.cameraMatrix();
    vMatrixItem.apply();

    mMatrixItem.apply();
    vao.draw({ program, clear: true });

    mMatrixItem1.apply();
    vao.draw({ program, clear: false });

    mMatrixItem2.apply();
    vao.draw({ program, clear: false });
    lastime = time;
    requestAnimationFrame(draw);
  }
  draw(0);
}
