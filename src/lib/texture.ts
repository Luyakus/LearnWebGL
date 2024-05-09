export class Texture {
  texture: WebGLTexture;
  gl: WebGL2RenderingContext;
  image?: HTMLImageElement | WebGLTexture;
  constructor(
    image: HTMLImageElement | WebGLTexture,
    gl: WebGL2RenderingContext
  ) {
    if (image instanceof WebGLTexture) {
      this.texture = image;
      this.image = image;
      this.gl = gl;
    } else {
      let texture = gl.createTexture();
      if (!texture) {
        throw new Error(`创建纹理失败, src: ${image.src}`);
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        image.width,
        image.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
      this.texture = texture;
      this.image = image;
      this.gl = gl;
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  active(index: number) {
    let gl = this.gl!;
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }
}

export class FrameBufferTexture {
  texture: WebGLTexture;
  gl: WebGL2RenderingContext;
  constructor(
    public size: { width: number; height: number },
    gl: WebGL2RenderingContext
  ) {
    let texture = gl.createTexture();
    if (!texture) {
      throw new Error(`创建纹理失败`);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      size.width,
      size.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    this.texture = texture;
    this.gl = gl;
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  active(index: number) {
    let gl = this.gl!;
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }
}
