import { Item } from "./item";
import { Shader } from "./shader";

export class Program {
  program: WebGLProgram;
  items: Item[] = [];

  constructor(
    vertexShader: WebGLShader | string,
    fragmentShader: WebGLShader | string,
    public gl: WebGL2RenderingContext
  ) {
    let program = gl.createProgram();
    if (!program) {
      throw new Error(`创建 program 失败`);
    }
    gl.attachShader(
      program,
      vertexShader instanceof WebGLShader
        ? vertexShader
        : new Shader(vertexShader, gl.VERTEX_SHADER, gl).shader
    );
    gl.attachShader(
      program,
      fragmentShader instanceof WebGLShader
        ? fragmentShader
        : new Shader(fragmentShader, gl.FRAGMENT_SHADER, gl).shader
    );
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      this.gl = gl;
      this.program = program;
    } else {
      throw new Error(`${gl.getProgramInfoLog(program)}`);
    }
  }

  use() {
    this.gl.useProgram(this.program);
  }

  unuse() {
    this.gl.useProgram(null);
  }

  registItem(item: Item) {
    if (!this.items.includes(item)) {
      this.items.push(item);
    }
  }

  updateItem(name: string, fn: (item: Item) => void) {
    this.items.forEach((item) => {
      if (item.name === name) {
        fn && fn(item);
      }
    });
  }
}
