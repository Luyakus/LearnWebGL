import { FrameBuffer } from "./framebuffer";
import { Program } from "./program";

export class VertexArray {
  vao: WebGLVertexArrayObject;

  constructor(public vertexCount: number, public gl: WebGL2RenderingContext) {
    let vao = gl.createVertexArray();
    if (!vao) {
      throw new Error("创建 vao 失败");
    }
    this.vertexCount = vertexCount;
    this.vao = vao;
    this.gl = gl;
  }

  

  bind() {
    this.gl.bindVertexArray(this.vao);
  }

  unbind() {
    this.gl.bindVertexArray(null);
  }

  draw(program: Program, clear: boolean = true, frameBuffer?: FrameBuffer) {
    this.bind();
    program.use();
    this.gl.enable(this.gl.DEPTH_TEST);
    if (frameBuffer) {
      frameBuffer.bind();
      if (clear) {
        this.gl.clearColor(0.1, 0.2, 0.3, 1);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
      }
      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    } else {
      if (clear) {
        this.gl.clearColor(0.1, 0.2, 0.3, 1);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
      }
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    }
    frameBuffer?.unbind();
    this.unbind();
    program.unuse();
  }
}
