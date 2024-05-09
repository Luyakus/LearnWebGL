import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";
import vertexSrc from "./vert.glsl";
import fragSrc from "./frag.glsl";
import { VertexArray } from "../../lib/vertexarray";
import png1 from "../../assets/1.png";
import png2 from "../../assets/2.png";
import { imageLoader } from "../../lib/imageloader";
import { Texture } from "../../lib/texture";

export async function lessonFourMain(canvas: HTMLCanvasElement) {

  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }

  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;
  let image1 = await imageLoader(png1);
  let image2 = await imageLoader(png2);

  VertexArray.create(gl, 6)
    .applyItem(
      {
        buffer: {
          name: "v_position",
          data: new Float32Array([
            -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,
          ]),
          width: 2,
        },
      },
      {
        buffer: {
          name: "v_texcoord",
          data: new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 1,
            1, 0
          ]),
          width: 2,
        },
      },
      {
        texture: {
          name: "u_image",
          data: new Texture(image1, gl),
        },
      },
      {
        texture: {
          name: "u_image1",
          data: new Texture(image2, gl),
        },
      }
    )
    .bind(
      new Program(
        new Shader(vertexSrc, gl.VERTEX_SHADER, gl).shader,
        new Shader(fragSrc, gl.FRAGMENT_SHADER, gl).shader,
        gl
      )
    )
    .draw();
}
