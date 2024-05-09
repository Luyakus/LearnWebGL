
export class Program {
  program: WebGLProgram;
  constructor(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
    public gl: WebGL2RenderingContext
  ) {
    let program = gl.createProgram();
    if (!program) {
      throw new Error(`创建 program 失败`);
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
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
}
