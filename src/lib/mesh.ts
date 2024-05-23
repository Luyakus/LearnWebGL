import { Item } from "./item";
import { Program } from "./program";
import { Texture } from "./texture";
import { VertexArray } from "./vertexarray";

export class Mesh {
  items: Item[] = [];
  textures: Texture[] = [];
  vao: VertexArray;
  program: Program;
  gl: WebGLRenderingContext;

  constructor(vao: VertexArray, program: Program, gl: WebGL2RenderingContext) {
    this.vao = vao;
    this.program = program;
    this.gl = gl;
  }

  appenTexture(texture: Texture) {
    this.textures.push(texture);
  }

  applyTexture(start: number) {
    this.textures.forEach((t, index)=> {
      t.active(index + start);
    })
  }

  appendItem(item: Item) {
    this.items.push(item);
  }

  applyItem() {
    if (!this.vao) {
      throw new Error("没有设置 vao");
    }
    if (!this.program) {
      throw new Error("没有设置 program");
    }
    if (!this.gl) {
      throw new Error("没有设置 gl");
    }
    let gl = this.vao.gl;
    let vao = this.vao;
    let program = this.program!;
    this.items.forEach((item) => {
      item.attach(vao, program, gl);
      item.apply();
    });
  }
}
