import * as OBJ from "webgl-obj-loader";

export interface GLResult<T> {
  message?: string;
  data?: T;
  result: boolean;
}

export function createShader(
  gl: WebGL2RenderingContext,
  type:
    | WebGLRenderingContextBase["FRAGMENT_SHADER"]
    | WebGLRenderingContextBase["VERTEX_SHADER"],
  source: string
): GLResult<WebGLShader> {
  let shader = gl.createShader(type);
  if (!shader) {
    return {
      result: false,
      message: `创建 ${
        type == gl.VERTEX_SHADER ? "vertexShader" : "fragmentShader"
      } shader 错误, source: ${source}`,
    };
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return {
      result: true,
      data: shader,
    };
  } else {
    return {
      result: false,
      message: `${gl.getShaderInfoLog(shader)}`,
    };
  }
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vsShader: WebGLShader,
  fsShader: WebGLShader
): GLResult<WebGLProgram> {
  let program = gl.createProgram();
  if (!program) {
    return {
      result: false,
      message: `创建 program 错误, vertexShader: ${vsShader}, fragmentShader: ${fsShader}`,
    };
  }
  gl.attachShader(program, vsShader);
  gl.attachShader(program, fsShader);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return {
      result: true,
      data: program,
    };
  } else {
    return {
      result: false,
      message: `${gl.getProgramInfoLog(program)}`,
    };
  }
}

export function degreesToRadians(degrees: number) {
  return degrees * Math.PI / 180;
}

export function createMeshs(mesh: OBJ.Mesh ) {
  mesh.materialNames.forEach(name => {
    
  })
}