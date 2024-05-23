import planetObjPath from "../../assets/planet/planet.obj";
import planetMtlPath from "../../assets/planet/planet.mtl";
import rockObjPath from "../../assets/rock/rock.obj";
import rockMtlPath from "../../assets/rock/rock.mtl";
import planetVertSrc from "./planet.vert.glsl";
import planetFragSrc from "./planet.frag.glsl";
import rockVertSrc from "./rock.vert.glsl";
import rockFragSrc from "./rock.frag.glsl";
import { modelLoader } from "../../lib/modelloader";
import { VertexArray } from "../../lib/vertexarray";
import { Program } from "../../lib/program";
import { Mesh } from "../../lib/mesh";
import {
  BufferItem,
  ElementItem,
  InstaceBufferItem,
  UniformItem,
} from "../../lib/item";
import { Texture } from "../../lib/texture";
import { mat4, vec3 } from "gl-matrix";
import { Camera } from "../../lib/camera";
import { degreesToRadians } from "../util";

export async function lessonSeventeenMain(canvas: HTMLCanvasElement) {
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("获取 webgl 失败");
    return;
  }
  canvas.width = canvas.clientWidth * 3;
  canvas.height = canvas.clientHeight * 3;

  let planetAttris = await modelLoader(planetObjPath, planetMtlPath);
  let camera = new Camera(canvas, vec3.set(vec3.create(), -20, 30, 180));
  let planet: Mesh[] = [];

  let mMatrix = mat4.create();
  let mMatrixItem = new UniformItem("m_matrix", mMatrix, (location, value) =>
    gl.uniformMatrix4fv(location, false, value)
  );
  let vMatrixItem = new UniformItem(
    "v_matrix",
    camera.cameraMatrix(),
    (location, value) => gl.uniformMatrix4fv(location, false, value)
  );
  let pMatrix = mat4.create();
  mat4.perspective(
    pMatrix,
    degreesToRadians(45),
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    300
  );
  let pMatrixItem = new UniformItem("p_matrix", pMatrix, (location, value) =>
    gl.uniformMatrix4fv(location, false, value)
  );

  let rotateMatrixItem = new UniformItem(
    "rotate_matrix",
    mat4.create(),
    (location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    }
  );

  planetAttris.forEach((attri) => {
    let vao = new VertexArray(attri.index.length, gl);
    let program = new Program(planetVertSrc, planetFragSrc, gl);
    let mesh = new Mesh(vao, program, gl);
    mesh.appendItem(new BufferItem("v_position", 3, attri.vertex));
    mesh.appendItem(new BufferItem("v_texcoord", 2, attri.texcoord));
    mesh.appendItem(new ElementItem(attri.index));
    mesh.appendItem(new UniformItem("u_image", 0, gl.uniform1i));
    mesh.appendItem(mMatrixItem);
    mesh.appendItem(vMatrixItem);
    mesh.appendItem(pMatrixItem);
    mesh.applyItem();
    mesh.appenTexture(new Texture(attri.images.diff!, gl));
    planet.push(mesh);
  });

  let lastTime = 0;
  let angle = 0;

  function drawPlanet() {
    planet.forEach((m, index) => {
      m.applyTexture(0);
      m.program.updateItem("m_matrix", (item) => {
        let mMatrix = mat4.create();
        mat4.scale(mMatrix, mMatrix, vec3.set(vec3.create(), 3, 3, 3));
        mat4.rotate(
          mMatrix,
          mMatrix,
          degreesToRadians(angle),
          vec3.set(vec3.create(), 0, 1, 0)
        );
        item.data = mMatrix;
        item.attach(m.vao, m.program, gl!);
        item.apply();
      });
      m.program.updateItem("v_matrix", (item) => {
        item.data = camera.cameraMatrix();
        item.attach(m.vao, m.program, gl!);
        item.apply();
      });
      m.vao.draw({ program: m.program, clear: index === 0 });
    });
  }

  let amount = 10000;
  let offset = 20;
  let radius = 90;
  let mMarixs: number[] = [];
  for (let i = 0; i < amount; i++) {
    let rockAnagle = ((i + 0.01) / amount) * 360.0;
    let displacement =
      Math.floor(Math.random() * 2 * offset * 100) / 100.0 - offset;
    let x = Math.sin(rockAnagle) * radius + displacement;
    displacement =
      Math.floor(Math.random() * 2 * offset * 100) / 100.0 - offset;
    let y = displacement * 0.4;
    displacement =
      Math.floor(Math.random() * 2 * offset * 100) / 100.0 - offset;
    let z = Math.cos(rockAnagle) * radius + displacement;

    let mMatrix = mat4.create();
    mat4.translate(mMatrix, mMatrix, vec3.set(vec3.create(), x, y, z));

    let scale = Math.random() * 0.2;
    mat4.scale(mMatrix, mMatrix, vec3.set(vec3.create(), scale, scale, scale));

    mat4.rotate(
      mMatrix,
      mMatrix,
      degreesToRadians(Math.random() * 360),
      vec3.set(vec3.create(), 0.4, 0.6, 0.8)
    );
    mMarixs.push(...mMatrix);
  }

  let rock: Mesh[] = [];
  let rockAttris = await modelLoader(rockObjPath, rockMtlPath);
  rockAttris.forEach((attri) => {
    let vao = new VertexArray(attri.index.length, gl);
    let program = new Program(rockVertSrc, rockFragSrc, gl);
    let mesh = new Mesh(vao, program, gl);
    mesh.appendItem(new BufferItem("v_position", 3, attri.vertex));
    mesh.appendItem(new BufferItem("v_texcoord", 2, attri.texcoord));
    mesh.appendItem(
      new InstaceBufferItem("m_matrix", 4, 4, new Float32Array(mMarixs))
    );
    mesh.appendItem(new ElementItem(attri.index));
    mesh.appendItem(new UniformItem("u_image", 0, gl.uniform1i));
    mesh.appendItem(mMatrixItem);
    mesh.appendItem(vMatrixItem);
    mesh.appendItem(pMatrixItem);
    mesh.appendItem(rotateMatrixItem);
    mesh.applyItem();
    mesh.appenTexture(new Texture(attri.images.diff!, gl));
    rock.push(mesh);
  });

  function drawRock() {
    rock.forEach((m) => {
      m.applyTexture(0);
      m.program.updateItem("rotate_matrix", (item) => {
        let mMatrix = mat4.create();
        mat4.rotate(
          mMatrix,
          mMatrix,
          degreesToRadians(angle),
          vec3.set(vec3.create(), 0, 1, 0)
        );
        item.data = mMatrix;
        item.attach(m.vao, m.program, gl!);
        item.apply();
      });
      m.program.updateItem("v_matrix", (item) => {
        item.data = camera.cameraMatrix();
        item.attach(m.vao, m.program, gl!);
        item.apply();
      });
      m.vao.draw({ program: m.program, clear: false, instaceCount: amount });
    });
  }

  function draw(time: number) {
    camera.move((time - lastTime) / 1000);
    drawPlanet();
    drawRock();

    lastTime = time;
    angle += 0.1;
    requestAnimationFrame(draw);
  }
  draw(0);
}
