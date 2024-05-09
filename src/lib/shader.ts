export class Shader {
  shader: WebGLShader;
  constructor(
    src: string,
    type:
      | WebGLRenderingContextBase["FRAGMENT_SHADER"]
      | WebGLRenderingContextBase["VERTEX_SHADER"],
    public gl: WebGL2RenderingContext
  ) {
    let shader = gl.createShader(type);
    if (!shader) {
      throw new Error(`创建shader失败, src: ${src}`);
    }
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      this.gl = gl;
      this.shader = shader;
    } else {
      throw new Error(`${gl.getShaderInfoLog(shader)}\nsrc:\n${src}`);
    }
  }
}
