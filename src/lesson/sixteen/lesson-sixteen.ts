import front from "../../assets/skybox/front.jpg";
import back from "../../assets/skybox/back.jpg";
import top from "../../assets/skybox/top.jpg";
import bottom from "../../assets/skybox/bottom.jpg";
import left from "../../assets/skybox/left.jpg";
import right from "../../assets/skybox/right.jpg";
import skyVertSrc from "./sky.vert.glsl";
import skyFragSrc from "./sky.frag.glsl";
import objVertSrc from "./obj.vert.glsl";
import objFragSrc from "./obj.frag.glsl";
import objPath from "../../assets/nanosuit_reflection/nanosuit.obj";
import mtlPath from "../../assets/nanosuit_reflection/nanosuit.mtl";

// import objPath from "../../assets/nanosuit/nanosuit.obj";
// import mtlPath from "../../assets/nanosuit/nanosuit.mtl";

import { imageLoader } from "../../lib/imageloader";
import { VertexArray } from "../../lib/vertexarray";
import { cubeVertex, skyCubeVertex } from "../cube";
import {
  BufferItem,
  ElementItem,
  StructUniformItem,
  UniformItem,
} from "../../lib/item";
import { mat3, mat4, vec3 } from "gl-matrix";
import { degreesToRadians } from "../util";
import { Program } from "../../lib/program";
import { Shader } from "../../lib/shader";
import { CubeTexture, Texture } from "../../lib/texture";
import { Camera } from "../../lib/camera";
import { fileLoader } from "../../lib/fileloader";
import { Mesh } from "../../lib/mesh";

export async function lessonSixteenMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;
  let topImage = await imageLoader(top);
  let bottomImage = await imageLoader(bottom);
  let leftImage = await imageLoader(left);
  let rightImage = await imageLoader(right);
  let frontImage = await imageLoader(front);
  let backImage = await imageLoader(back);
  let skyTexture = new CubeTexture(
    [rightImage, leftImage, topImage, bottomImage, frontImage, backImage],
    gl
  );

  let skyVao = new VertexArray(skyCubeVertex.length / 3, gl);
  let skyProgram = new Program(
    new Shader(skyVertSrc, gl.VERTEX_SHADER, gl).shader,
    new Shader(skyFragSrc, gl.FRAGMENT_SHADER, gl).shader,
    gl
  );
  let bufferItem = new BufferItem("v_position", 3, skyCubeVertex);
  let skyTextureItem = new UniformItem("skybox", 0, gl.uniform1i);

  let mMatrixItem = new UniformItem(
    "m_matrix",
    mat4.create(),
    (location, value) => gl.uniformMatrix4fv(location, false, value)
  );

  let vMatrixItem = new UniformItem(
    "v_matrix",
    mat4.create(),
    (location, value) => gl.uniformMatrix4fv(location, false, value)
  );

  let pMatrix = mat4.create();
  mat4.perspective(
    pMatrix,
    degreesToRadians(45),
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  let pMatrixItem = new UniformItem("p_matrix", pMatrix, (location, value) =>
    gl.uniformMatrix4fv(location, false, value)
  );

  [bufferItem, skyTextureItem, vMatrixItem, pMatrixItem].forEach((item) => {
    item.attach(skyVao, skyProgram, gl);
    item.apply();
  });

  let camera = new Camera(canvas);
  let cameraPositionItem = new UniformItem(
    "camera_position",
    camera.position,
    gl.uniform3fv
  );

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

  let lightItem = new StructUniformItem("light", [
    new UniformItem(
      ".ambient",
      vec3.set(vec3.create(), 0.5, 0.5, 0.5),
      gl.uniform3fv
    ),
    new UniformItem(
      ".diffuse",
      vec3.set(vec3.create(), 0.8, 0.8, 0.8),
      gl.uniform3fv
    ),
    new UniformItem(
      ".specular",
      vec3.set(vec3.create(), 1, 1, 1),
      gl.uniform3fv
    ),
    new UniformItem(
      ".direction",
      vec3.set(vec3.create(), -1, -1, -1),
      gl.uniform3fv
    ),
  ]);
  let shininessItem = new UniformItem("shininess", 32, gl.uniform1f);

  let meshes: { [key in string]: Mesh } = {};
  let textures: { [key in string]: Texture[] } = {};

  for (const m of scene.meshes) {
    let vao = new VertexArray(m.faces.length * 3, gl);
    let program = new Program(
      new Shader(objVertSrc, gl.VERTEX_SHADER, gl).shader,
      new Shader(objFragSrc, gl.FRAGMENT_SHADER, gl).shader,
      gl
    );
    let mesh = new Mesh(vao, program, gl);

    let vertexBufferItem = new BufferItem(
      "v_position",
      3,
      new Float32Array(m.vertices.map((vertex) => vertex * 0.1))
    );

    let normalBufferItem = new BufferItem(
      "v_normal",
      3,
      new Float32Array(m.normals)
    );

    let texcoordBufferItem = new BufferItem(
      "v_texcoord",
      2,
      new Float32Array(m.texturecoords[0])
    );

    let elementBufferItem = new ElementItem(
      new Uint16Array(m.faces.flatMap((face) => face))
    );

    let diffTextureItem = new UniformItem("dif_texture", 1, gl.uniform1i);
    let specTextureItem = new UniformItem("spec_texture", 2, gl.uniform1i);
    let refTextureItem = new UniformItem("reflect_texture", 3, gl.uniform1i);

    mesh.appendItem(vertexBufferItem);
    mesh.appendItem(normalBufferItem);
    mesh.appendItem(texcoordBufferItem);
    mesh.appendItem(elementBufferItem);
    mesh.appendItem(cameraPositionItem);
    mesh.appendItem(lightItem);
    mesh.appendItem(skyTextureItem);
    mesh.appendItem(diffTextureItem);
    mesh.appendItem(specTextureItem);
    mesh.appendItem(refTextureItem);
    mesh.appendItem(shininessItem);
    mesh.appendItem(mMatrixItem);
    mesh.appendItem(vMatrixItem);
    mesh.appendItem(pMatrixItem);
    mesh.applyItem();
    meshes[m.name] = mesh;

    let path = objPath.substring(0, objPath.lastIndexOf("/"));
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

    let specTextureName = scene.materials[m.materialindex].properties.find(
      (p) => {
        return p.semantic === 2 && p.type === 3;
      }
    )?.value as string;

    if (specTextureName) {
      let image = await imageLoader(`${path}/${specTextureName}`);
      if (!textures[m.name]) {
        textures[m.name] = [];
      }
      textures[m.name].push(new Texture(image, gl));
    }

    let refTextureName = scene.materials[m.materialindex].properties.find(
      (p) => {
        return p.semantic === 3 && p.type === 3;
      }
    )?.value as string;

    if (refTextureName) {
      let image = await imageLoader(`${path}/${refTextureName}`);
      if (!textures[m.name]) {
        textures[m.name] = [];
      }
      textures[m.name].push(new Texture(image, gl));
    }
    console.log(refTextureName);
  }
  skyTexture.active(0);
  let lastTime = 0;
  let angle = 0;
  function draw(time: number) {
    camera.move((time - lastTime) / 1000);
    Object.keys(meshes).forEach((key, index) => {
      let mesh = meshes[key];
      textures[key].forEach((t, index) => {
        t.active(index + 1);
      });
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
      mesh.vao.draw({program: mesh.program, clear: index === 0}); 
    });
    let vMatrix = camera.cameraMatrix();
    let mat3Matrix = mat3.create();
    mat3.fromMat4(mat3Matrix, vMatrix);
    vMatrix = mat4.fromValues(
      mat3Matrix[0],
      mat3Matrix[1],
      mat3Matrix[2],
      0,
      mat3Matrix[3],
      mat3Matrix[4],
      mat3Matrix[5],
      0,
      mat3Matrix[6],
      mat3Matrix[7],
      mat3Matrix[8],
      0,
      0,
      0,
      0,
      1
    );
    vMatrixItem.attach(skyVao, skyProgram, gl!);
    vMatrixItem.data = vMatrix;
    vMatrixItem.apply();
    skyVao.draw({
      program: skyProgram,
      clear: false,
      glConfig: () => {
        gl!.depthFunc(gl!.LEQUAL);
      },
    });
    gl!.depthFunc(gl!.LESS);
    angle += 2;
    lastTime = time;
    requestAnimationFrame(draw);
  }
  draw(0);
}
