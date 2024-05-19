import objPath from "../../assets/nanosuit/nanosuit.obj";
// import objPath from "../../assets/diablo3/diablo3.obj";
// import objPath from "../../assets/skull/skull.obj"

import mtlPath from "../../assets/nanosuit/nanosuit.mtl";
// import mtlPath from "../../assets/skull/skull.mtl";

import { fileLoader } from "../../lib/fileloader";
import { VertexArray } from "../../lib/vertexarray";
import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";
import vertSrc from "./obj.vert.glsl";
import fragSrc from "./obj.frag.glsl";
import { Mesh } from "../../lib/mesh";
import {
  BufferItem,
  ElementItem,
  StructUniformItem,
  UniformItem,
} from "../../lib/item";
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

  if (!objRes || !mtlRes) {
    return;
  }
  const objBuffer = new Uint8Array(await objRes.arrayBuffer());
  const mtlBuffer = new Uint8Array(await mtlRes.arrayBuffer());

  //@ts-ignore
  let ajs = await assimpjs();
  let fileList = new ajs.FileList();
  fileList.AddFile(objPath, objBuffer);
  fileList.AddFile(mtlPath, mtlBuffer);
  let result = ajs.ConvertFileList(fileList, "assjson");
  if (!result.IsSuccess() || result.FileCount() == 0) {
    console.log("obj 文件解析错误");
    return;
  }
  // get the result file, and convert to string
  let resultFile = result.GetFile(0);
  let jsonContent = new TextDecoder().decode(resultFile.GetContent());

  // parse the result json
  let scene: Assimpjs.Scene = JSON.parse(jsonContent);
  console.log(scene);

  let camera = new Camera(canvas);
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
    vec3.set(vec3.create(), 0, 0, 3),
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

  let lightItem = new StructUniformItem("light", [
    new UniformItem(
      ".ambient",
      vec3.set(vec3.create(), 0.1, 0.1, 0.1),
      gl.uniform3fv
    ),
    new UniformItem(
      ".diffuse",
      vec3.set(vec3.create(), 0, 1, 0.8),
      gl.uniform3fv
    ),
    new UniformItem(
      ".ambient",
      vec3.set(vec3.create(), 1, 1, 1),
      gl.uniform3fv
    ),
    new UniformItem(
      ".direction",
      vec3.set(vec3.create(), 0, 0, -1),
      gl.uniform3fv
    ),
  ]);

  let shininessItem = new UniformItem("shininess", 32, gl.uniform1f);
  let cameraPositionItem = new UniformItem(
    "camera_position",
    camera.position,
    gl.uniform3fv
  );

  let meshes: { [k in string]: Mesh } = {};
  let textures: { [k in string]: Texture[] } = {};
  for (const m of scene.meshes) {
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
      new Float32Array(m.vertices.map((vertex) => vertex * 0.1))
    );

    let texcoordBufferItem = new BufferItem(
      "v_texcoord",
      2,
      new Float32Array(m.texturecoords[0])
    );

    let normalBufferItem = new BufferItem(
      "v_normal",
      3,
      new Float32Array(m.normals)
    );

    let difTextureItem = new UniformItem("dif_texture", 0, gl.uniform1i);
    let specTextureItem = new UniformItem("spec_texture", 1, gl.uniform1i);

    let elementBufferItem = new ElementItem(
      new Uint16Array(m.faces.flatMap((face) => face))
    );

    mesh.appendItem(vertexBufferItem);
    mesh.appendItem(texcoordBufferItem);
    mesh.appendItem(normalBufferItem);
    mesh.appendItem(elementBufferItem);
    mesh.appendItem(difTextureItem);
    mesh.appendItem(specTextureItem);
    mesh.appendItem(shininessItem);
    mesh.appendItem(lightItem);
    mesh.appendItem(cameraPositionItem);
    mesh.appendItem(mMatrixItem);
    mesh.appendItem(vMatrixItem);
    mesh.appendItem(pMatrixItem);
    mesh.applyItem();
    meshes[m.name] = mesh;
    let path = objPath.substring(0, objPath.lastIndexOf("/"));
    console.log(path);
    let difTextureName = scene.materials[m.materialindex].properties.find(
      (p) => {
        return p.semantic === 1 && p.type === 3;
      }
    )?.value as string;
    if (difTextureName) {
      let image = await imageLoader(`${path}/${difTextureName}`);
      if (!textures[m.name]) {
        textures[m.name] = [];
      }
      textures[m.name].push(new Texture(image, gl));
    }
    console.log(difTextureName, m.name, "1111");

    let specTextureName = scene.materials[m.materialindex].properties.find(
      (p) => {
        return p.semantic === 2 && p.type === 3;
      }
    )?.value as string;
    console.log(specTextureName, m.name, "2222");

    if (specTextureName) {
      let image = await imageLoader(`${path}/${specTextureName}`);
      if (!textures[m.name]) {
        textures[m.name] = [];
      }
      textures[m.name].push(new Texture(image, gl));
    }
  }

  let angle = 0;
  let lastTime = 0;

  function draw(time: number) {
    camera.move((time - lastTime) / 1000);
    Object.keys(meshes).forEach((key, index) => {
      try {
        textures[key].forEach((t, index) => {
          t.active(index);
        });
      } catch (error) {
        console.log(key, "3333");
        return;
      }

      let mesh = meshes[key];
      let mMatrix = mat4.create();
      mat4.rotate(
        mMatrix,
        mMatrix,
        degreesToRadians(angle),
        vec3.set(vec3.create(), 0, 1, 0)
      );
      mat4.translate(mMatrix, mMatrix, vec3.set(vec3.create(), 0, -0.5, 0));
      mMatrixItem.data = mMatrix;
      mMatrixItem.attach(mesh.vao, mesh.program, gl!);
      mMatrixItem.apply();
      vMatrixItem.data = camera.cameraMatrix();
      vMatrixItem.attach(mesh.vao, mesh.program, gl!);
      vMatrixItem.apply();
      cameraPositionItem.data = camera.position;
      cameraPositionItem.attach(mesh.vao, mesh.program, gl!);
      cameraPositionItem.apply();
      mesh.draw(index == 0);
    });
    angle += 0.1;
    lastTime = time;
    requestAnimationFrame(draw);
  }
  draw(0);
}
