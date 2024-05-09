import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";
import vertexSrc from "./vert.glsl";
import fragSrc from "./frag.glsl";
import { VertexArray } from "../../lib/vertexarray";
import png1 from "../../assets/1.png";
import png2 from "../../assets/2.png";
import { imageLoader } from "../../lib/imageloader";
import { Texture } from "../../lib/texture";
import { BufferItem, TextureItem } from "../../lib/item";

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

  let vao = new VertexArray(6, gl);
  let program = new Program(
    new Shader(vertexSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(fragSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );
  let vertexBuffer = new BufferItem(
    "v_position",
    2,
    new Float32Array([
      -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,
    ])
  );
  let texcoordBuffer = new BufferItem(
    "v_texcoord",
    2,
    new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0])
  );
  let textureItem1 = new TextureItem("u_image", 0, new Texture(image1, gl));
  let textureItem2 = new TextureItem("u_image1", 1, new Texture(image2, gl));

  [vertexBuffer, texcoordBuffer, textureItem1, textureItem2].forEach((item) => {
    item.attach(vao, program, gl);
    item.apply();
  });
  vao.draw(program);
}
