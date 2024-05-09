import { FrameBufferTexture } from "./texture";

export class FrameBuffer {
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
    this.fbo = fbo;
    this.gl = gl;
  }

  bind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
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
