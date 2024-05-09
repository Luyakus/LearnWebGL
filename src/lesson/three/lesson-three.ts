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
import { BufferItem, TextureItem } from "../../lib/item";

export async function lessonThreeMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  let image = await imageLoader(png);
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;

  let vao = new VertexArray(6, gl);
  let program = new Program(
    new Shader(vertSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(fragSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );
  let frameBuffer = new FrameBuffer(
    new FrameBufferTexture({ width: image.width, height: image.height }, gl),
    gl
  );

  let vertexBuffer = new BufferItem(
    "v_position",
    2,
    new Float32Array([-1, 1, 1, 1, -1, -1, -1, -1, 1, -1, 1, 1])
  );
  vertexBuffer.attach(vao, program, gl);
  vertexBuffer.apply();

  let texcoordBuffer = new BufferItem(
    "v_texCoord",
    2,
    new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0])
  );
  texcoordBuffer.attach(vao, program, gl);
  texcoordBuffer.apply();

  let textureItem = new TextureItem("u_image", 0, new Texture(image, gl));
  textureItem.attach(vao, program, gl);
  textureItem.apply();
  vao.draw(program, frameBuffer);

  let program1 = new Program(
    new Shader(vertSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(fragMosaicSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );
  let frameBuffer1 = new FrameBuffer(
    new FrameBufferTexture({ width: image.width, height: image.height }, gl),
    gl
  );
  vertexBuffer.attach(vao, program1, gl);
  vertexBuffer.apply();
  texcoordBuffer.attach(vao, program1, gl);
  texcoordBuffer.apply();
  textureItem.attach(vao, program1, gl);
  textureItem.texture = frameBuffer.texture;
  textureItem.apply();
  vao.draw(program1, frameBuffer1);

  let program2 = new Program(
    new Shader(vertSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(fragAngleSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );
  vertexBuffer.attach(vao, program2, gl);
  vertexBuffer.apply();
  texcoordBuffer.attach(vao, program2, gl);
  texcoordBuffer.apply();
  textureItem.attach(vao, program2, gl);
  textureItem.texture = frameBuffer1.texture;
  textureItem.apply();
  vao.draw(program2);
}
