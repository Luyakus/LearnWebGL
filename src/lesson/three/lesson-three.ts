import { imageLoader } from "../../lib/imageloader";
import png from "../../assets/1.png";
import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";
import vertSrc from "./vert.glsl";
import fragSrc from "./frag.glsl";
import fragMosaicSrc from "./frag.mosaic.glsl";
import fragAngleSrc from "./frag.angle.glsl";
import { VertexArray } from "../../lib/vertexarray";
import { FrameBufferTexture, Texture } from "../../lib/texture";
import { FrameBuffer } from "../../lib/framebuffer";

export async function lessonThreeMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  let image = await imageLoader(png);
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;
  let program = new Program(
    new Shader(vertSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(fragSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );

  let program1 = new Program(
    new Shader(vertSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(fragMosaicSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );

  let program2 = new Program(
    new Shader(vertSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(fragAngleSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );

  let frameBuffer = new FrameBuffer(
    new FrameBufferTexture({ width: image.width, height: image.height }, gl),
    gl
  );
  let frameBuffer1 = new FrameBuffer(
    new FrameBufferTexture({ width: image.width, height: image.height }, gl),
    gl
  );

  VertexArray.create(gl, 6)
    .applyItem(
      {
        buffer: {
          name: "v_position",
          data: new Float32Array([-1, 1, 1, 1, -1, -1, -1, -1, 1, -1, 1, 1]),
          width: 2,
        },
      },
      {
        buffer: {
          name: "v_texCoord",
          data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0]),
          width: 2,
        },
        texture: {
          data: new Texture(image, gl),
          name: "u_image",
        },
      }
    )
    .bind(program)
    .draw(frameBuffer)
    .applyItem(
      {
        buffer: {
          name: "v_position",
          data: new Float32Array([-1, 1, 1, 1, -1, -1, -1, -1, 1, -1, 1, 1]),
          width: 2,
        },
      },
      {
        buffer: {
          name: "v_texCoord",
          data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0]),
          width: 2,
        },
        texture: {
          data: new Texture(frameBuffer.texture.texture, gl),
          name: "u_image",
        },
      }
    )
    .bind(program1)
    .draw(frameBuffer1)
    .applyItem(
      {
        buffer: {
          name: "v_position",
          data: new Float32Array([-1, 1, 1, 1, -1, -1, -1, -1, 1, -1, 1, 1]),
          width: 2,
        },
      },
      {
        buffer: {
          name: "v_texCoord",
          data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0]),
          width: 2,
        },
        texture: {
          data: new Texture(frameBuffer1.texture.texture, gl),
          name: "u_image",
        },
      },
      {
        uniform: {
          data: -1,
          name: "v_flag",
          setter: gl.uniform1i,
        },
      }
    )
    .bind(program2)
    .draw();
}
