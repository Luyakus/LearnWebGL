import { RenderBuffer } from "./renderbuffer";
import { FrameBufferTexture } from "./texture";

export class FrameBuffer {
  rbo: RenderBuffer;
  fbo: WebGLFramebuffer;
  constructor(
    public texture: FrameBufferTexture,
    public gl: WebGL2RenderingContext
  ) {
    let fbo = gl.createFramebuffer();
    if (!fbo) {
      throw new Error("创建fbo失败");
    }
    this.texture = texture;
    this.rbo = new RenderBuffer(texture.size, gl);
    this.fbo = fbo;
    this.gl = gl;
  }

  bind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
    this.rbo.bind();
    this.gl.framebufferRenderbuffer(
      this.gl.FRAMEBUFFER,
      this.gl.DEPTH_STENCIL_ATTACHMENT,
      this.gl.RENDERBUFFER,
      this.rbo.rbo
    );
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.texture.texture,
      0
    );
    if (!this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER)) {
      throw new Error("fbo 绑定纹理失败");
    }
    this.gl.viewport(0, 0, this.texture.size.width, this.texture.size.height);
  }

  unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
}
