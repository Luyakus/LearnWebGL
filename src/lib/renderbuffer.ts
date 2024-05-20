export class RenderBuffer {
  rbo: WebGLRenderbuffer;
  constructor(
    public size: { width: number; height: number },
    public gl: WebGL2RenderingContext
  ) {
    this.gl = gl;
    this.size = size;
    let rbo = gl.createRenderbuffer();
    if (!rbo) {
      throw new Error("创建 renderbuffer 失败");
    }
    this.rbo = rbo;
  }
  bind() {
    let gl = this.gl;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.rbo);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH24_STENCIL8,
      this.size.width,
      this.size.height
    );
  }

  unbind() {
    let gl = this.gl;   
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }
}
