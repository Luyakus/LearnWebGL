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

  let vao = VertexArray.create(gl, cubeVertex.length / 3)
    .applyItem(
      {
        buffer: {
          name: "v_position",
          data: cubeVertex,
          width: 3,
        },
      },
      {
        buffer: {
          name: "v_texcoord",
          data: textureVertex,
          width: 2,
        },
      },
      {
        texture: {
          name: "u_image",
          data: new Texture(image, gl),
        },
      }
    )
    .bind(
      new Program(
        new Shader(vertSrc, gl.VERTEX_SHADER, gl).shader,
        new Shader(fragSrc, gl.FRAGMENT_SHADER, gl).shader,
        gl
      )
    );
  let angle = 0.1

  function draw() {
    angle += 0.05;
    let modelMat4 = Matrix.mat4.create();
    let rotateVec3 = Matrix.vec3.create();
    Matrix.vec3.set(rotateVec3, 1, 1, 1);
    Matrix.mat4.rotate(modelMat4, modelMat4, angle, rotateVec3);

    let mat4 = Matrix.mat4.create();
    Matrix.mat4.multiply(mat4, viewMat4, modelMat4);
    Matrix.mat4.multiply(mat4, projectMat4, mat4);

    vao.applyItem({
      uniform: {
        name: "v_mat4",
        data: mat4,
        setter: function (location, value) {
          gl!.uniformMatrix4fv(location, false, value);
        },
      },
    }).draw();
    // requestAnimationFrame(draw);
  }

  draw()
}
