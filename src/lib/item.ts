import { Program } from "./program";
import { VertexArray } from "./vertexarray";

export abstract class Item {
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
    public data: Float32Array,
    public elementItem?: ElementItem
  ) {
    super();
    this.name = name;
    this.data = data;
    this.width = width;
    this.elementItem = elementItem;
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
    if (!this.buffer) {
      this.buffer = gl.createBuffer()!;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
    if (this.elementItem) {
      this.elementItem.attach(vao, program, gl);
      this.elementItem.apply();
    }
    gl.vertexAttribPointer(location, this.width, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(location);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    if (this.elementItem) {
      // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
    vao.unbind();
    program.unuse();
  }
}

export class ElementItem extends Item {
  buffer?: WebGLBuffer;
  constructor(public data: Uint16Array) {
    super();
    this.data = data;
    console.log(this.data);
  }

  apply(): void {
    super.apply();
    let gl = this.gl!;
    if (!this.buffer) {
      this.buffer = gl.createBuffer()!;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
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
