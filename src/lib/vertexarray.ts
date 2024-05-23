import { FrameBuffer } from "./framebuffer";
import { Program } from "./program";

interface DrawContext {
  program: Program;
  clear: boolean;
  instaceCount?: number;
  frameBuffer?: FrameBuffer;
  glConfig?: () => void;
}

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

  draw(context: DrawContext) {
    let program = context.program;
    let frameBuffer = context.frameBuffer;
    let clear = context.clear;
    let glConfig = context.glConfig;
    this.bind();
    program.use();
    this.gl.enable(this.gl.DEPTH_TEST);
    let buffer = this.gl.getParameter(this.gl.ELEMENT_ARRAY_BUFFER_BINDING);
    if (frameBuffer) {
      frameBuffer.bind();
    } else {
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }
    if (clear) {
      this.gl.clearColor(0.1, 0.2, 0.3, 1);
      this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
    }
    glConfig && glConfig();
    if (buffer) {
      if (context.instaceCount) {
        this.gl.drawElementsInstanced(
          this.gl.TRIANGLES,
          this.vertexCount,
          this.gl.UNSIGNED_SHORT,
          0,
          context.instaceCount
        );
      } else {
        this.gl.drawElements(
          this.gl.TRIANGLES,
          this.vertexCount,
          this.gl.UNSIGNED_SHORT,
          0
        );
      }
    } else {
      if (context.instaceCount) {
        this.gl.drawArraysInstanced(
          this.gl.TRIANGLES,
          0,
          this.vertexCount,
          context.instaceCount
        );
      } else {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
      }
    }
    frameBuffer?.unbind();
    this.unbind();
    program.unuse();
  }
}
