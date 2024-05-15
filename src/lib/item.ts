import { Program } from "./program";
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

export class UniformItem extends Item {
  constructor(
    public name: string,
    public data: any,
    public setter: (location: any, value: any) => void
  ) {
    super();
    this.name = name;
    this.data = data;
    this.setter = setter;
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
    if (location < 0) {
      throw new Error(`获取 ${this.name} location 失败`);
    }
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

export class StructUniformItem extends Item {
  constructor(public scope: string, public unifromItems: UniformItem[]) {
    super();
    this.scope = scope;
    this.unifromItems = unifromItems;
    this.unifromItems.forEach((item) => {
      item.name = scope + item.name;
    });
  }

  item(name: string) {
    let findItem = null;
    this.unifromItems.forEach((item) => {
      if (item.name.includes(name)) {
        findItem = item;
      }
    })
    return findItem;
  }

  attach(vao: VertexArray, program: Program, gl: WebGL2RenderingContext) {
    super.attach(vao, program, gl);
    this.unifromItems.forEach((item) => {
      item.attach(vao, program, gl);
    });
  }

  apply() {
    super.apply();
    this.unifromItems.forEach((item) => item.apply());
  }
}
