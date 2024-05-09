import { FrameBuffer } from "./framebuffer";
import { Program } from "./program";
import { Texture } from "./texture";

interface VertexItem {
  buffer?: {
    data: Float32Array;
    name: string;
    width: number;
  };
  texture?: {
    name: string;
    data: Texture;
  };
  uniform?: {
    name: string;
    data: any;
    setter: (location: any, value: any) => void;
  };
}

export class VertexArray {
  vao: WebGLVertexArrayObject;
  vertexItems: VertexItem[] = [];
  constructor(public gl: WebGL2RenderingContext, public vertexCount: number) {
    let vao = gl.createVertexArray();
    if (!vao) {
      throw new Error("创建 vao 失败");
    }
    this.vertexCount;
    this.vao = vao;
    this.gl = gl;
  }
  static create(gl: WebGL2RenderingContext, vertexCount: number) {
    return new VertexArray(gl, vertexCount);
  }

  applyItem(...item: VertexItem[]) {
    this.vertexItems = [];
    this.vertexItems.push(...item);
    return this;
  }

  bind(program: Program) {
    program.use();
    this.gl.bindVertexArray(this.vao);
    this.vertexItems.forEach((item, index) => {
      if (item.buffer) {
        let location = this.gl.getAttribLocation(
          program.program,
          item.buffer.name
        );
        this.gl.enableVertexAttribArray(location);
        let buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(
          this.gl.ARRAY_BUFFER,
          item.buffer.data,
          this.gl.STATIC_DRAW
        );
        this.gl.vertexAttribPointer(
          location,
          item.buffer.width,
          this.gl.FLOAT,
          false,
          0,
          0
        );
      }

      if (item.texture) {
        this.gl.activeTexture(this.gl.TEXTURE0 + index);
        this.gl.bindTexture(this.gl.TEXTURE_2D, item.texture.data.texture);
        let textrueLocation = this.gl.getUniformLocation(
          program.program,
          item.texture.name
        );
        this.gl.uniform1i(textrueLocation, index);
      }
      if (item.uniform) {
        let location = this.gl.getUniformLocation(
          program.program,
          item.uniform.name
        );
        item.uniform.setter.call(this.gl, location, item.uniform.data);
      }
    });
    return this;
  }

  unbind() {
    this.gl.bindVertexArray(null);
  }

  draw(frameBuffer?: FrameBuffer) {
    this.gl.enable(this.gl.DEPTH_TEST);
    if (frameBuffer) {
      frameBuffer.bind();
      this.gl.clearColor(0.1, 0.2, 0.3, 1);
      this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    } else {
      this.gl.clearColor(0.1, 0.2, 0.3, 1);
      this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    }

    frameBuffer?.unbind();
    this.unbind();
    return this;
  }
}
