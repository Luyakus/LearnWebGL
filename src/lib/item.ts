import { Program } from "./program";
import { Texture } from "./texture";
import { VertexArray } from "./vertexarray";

abstract class Item {
  vao?: VertexArray;
  program?: Program;
  gl?: WebGL2RenderingContext;

  constructor() {}
  attach(vao: VertexArray, program: Program, gl: WebGL2RenderingContext) {
    this.vao = vao;
    this.program = program;
    this.gl = gl;
  }

  apply() {
    if (!this.gl) {
      throw new Error("webgl 为空");
    }
    if (!this.program) {
      throw new Error("program 为空");
    }
    if (!this.vao) {
      throw new Error("vao 为空");
    }
  }
}

export class TextureItem extends Item {
  constructor(
    public name: string,
    public index: number,
    public texture: Texture
  ) {
    super();
    this.name = name;
    this.index = index;
    this.texture = texture;
  }

  apply() {
    super.apply();
    let program = this.program!;
    let gl = this.gl!;
    program.use();
    let textrueLocation = gl.getUniformLocation(program.program, this.name);
    gl.activeTexture(gl.TEXTURE0 + this.index);
    gl.bindTexture(gl.TEXTURE_2D, this.texture.texture);
    gl.uniform1i(textrueLocation, this.index);
    console.log(textrueLocation, this.index, this.texture.image);
    program.unuse();
  }
}

export class UniformItem extends Item {
  constructor(
    public name: string,
    public data: any,
    public setter: (location: any, value: any) => void
  ) {
    super();
    this.name = name;
    (this.data = data), (this.setter = setter);
  }

  apply() {
    super.apply();
    let program = this.program!;
    let gl = this.gl!;
    program.use();
    let location = gl.getUniformLocation(program.program, this.name);
    this.setter.call(this.gl, location, this.data);
    program.unuse();
  }
}

export class BufferItem extends Item {
  buffer?: WebGLBuffer;
  constructor(
    public name: string,
    public width: number,
    public data: Float32Array
  ) {
    super();
    this.name = name;
    this.data = data;
    this.width = width;
  }

  apply() {
    super.apply();
    let vao = this.vao!;
    let program = this.program!;
    let gl = this.gl!;
    vao.bind();
    program.use();
    let location = gl.getAttribLocation(program.program, this.name);
    gl.enableVertexAttribArray(location);
    if (!this.buffer) {
      this.buffer = gl.createBuffer()!;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(location, this.width, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    vao.unbind();
    program.unuse();
  }
}
