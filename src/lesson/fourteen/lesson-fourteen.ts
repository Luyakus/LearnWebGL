// import objPath from "../../assets/nanosuit/nanosuit.obj";
import objPath from "../../assets/diablo3/diablo3.obj";
import png from "../../assets/diablo3/diablo3.png";
import mtlPath from "../../assets/nanosuit/nanosuit.mtl";
import { fileLoader } from "../../lib/fileloader";
import { VertexArray } from "../../lib/vertexarray";
import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";
import vertSrc from "./obj.vert.glsl";
import fragSrc from "./obj.frag.glsl";
import { Mesh } from "../../lib/mesh";
import { BufferItem, ElementItem, UniformItem } from "../../lib/item";
import { mat4, vec3 } from "gl-matrix";
import { degreesToRadians } from "../util";
import { Camera } from "../../lib/camera";
import { imageLoader } from "../../lib/imageloader";
import { Texture } from "../../lib/texture";

export async function lessonFourteenMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;

  let objRes = await fileLoader(objPath);
  let mtlRes = await fileLoader(mtlPath);
  let image = await imageLoader(png);

  if (!objRes || !mtlRes) {
    return;
  }
  const objBuffer = new Uint8Array(await objRes.arrayBuffer());
  // const mtlBuffer = new Uint8Array(await mtlRes.arrayBuffer());

  //@ts-ignore
  let ajs = await assimpjs();
  let fileList = new ajs.FileList();
  fileList.AddFile(objPath, objBuffer);
  // fileList.AddFile(mtlPath, mtlBuffer);
  let result = ajs.ConvertFileList(fileList, "assjson");
  if (!result.IsSuccess() || result.FileCount() == 0) {
    console.log("obj 文件解析错误");
    return;
  }
  // get the result file, and convert to string
  let resultFile = result.GetFile(0);
  let jsonContent = new TextDecoder().decode(resultFile.GetContent());

  // parse the result json
  let resultJson: Assimpjs.Scene = JSON.parse(jsonContent);
  console.log(resultJson);

  let mMatrixItem = new UniformItem(
    "m_matrix",
    mat4.create(),
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );

  let vMatrix = mat4.create();
  mat4.lookAt(
    vMatrix,
    vec3.set(vec3.create(), 0, 0, 15),
    vec3.set(vec3.create(), 0, 0, 0),
    vec3.set(vec3.create(), 0, 1, 0)
  );
  let vMatrixItem = new UniformItem("v_matrix", vMatrix, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });

  let pMatrix = mat4.create();
  mat4.perspective(
    pMatrix,
    degreesToRadians(45),
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  let pMatrixItem = new UniformItem("p_matrix", pMatrix, (location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });
  let meshes: Mesh[] = [];
  resultJson.meshes.forEach((m) => {
    let vao = new VertexArray(m.faces.length * 3, gl);
    let program = new Program(
      new Shader(vertSrc, gl.VERTEX_SHADER, gl).shader,
      new Shader(fragSrc, gl.FRAGMENT_SHADER, gl).shader,
      gl
    );
    let mesh = new Mesh(vao, program, gl);
    let vertexBufferItem = new BufferItem(
      "v_position",
      3,
      new Float32Array(m.vertices)
    );
    let texcoordBufferItem = new BufferItem("v_texcoord", 2, new Float32Array(m.texturecoords));

    let textureItem = new UniformItem("texture0", 0, gl.uniform1i);

    let elementBufferItem = new ElementItem(
      new Uint16Array(m.faces.flatMap((face) => face))
    );


    mesh.appendItem(vertexBufferItem);
    mesh.appendItem(elementBufferItem);
    // mesh.appendItem(texcoordBufferItem);
    mesh.appendItem(textureItem);
    mesh.appendItem(mMatrixItem);
    mesh.appendItem(vMatrixItem);
    mesh.appendItem(pMatrixItem);
    mesh.applyItem();
    meshes.push(mesh);
  });

  let texture0 = new Texture(image, gl);
  texture0.active(0);

  let angle = 0;
  let lastTime = 0;
  let camera = new Camera(canvas);
  console.log(meshes.length);
  function draw(time: number) {
    camera.move((time - lastTime) / 1000);

    meshes.forEach((mesh, index) => {
      if (index === 0) {
        let mMatrix = mat4.create();
        mat4.rotate(
          mMatrix,
          mMatrix,
          degreesToRadians(angle),
          vec3.set(vec3.create(), 0, 1, 0)
        );
        mMatrixItem.data = mMatrix;
        mMatrixItem.apply();
        vMatrixItem.data = camera.cameraMatrix();
        vMatrixItem.apply();
        mesh.draw(index == 0);
      }
    });
    angle += 0.1;
    lastTime = time;
    requestAnimationFrame(draw);
  }
  draw(0);
}
