import { fileLoader } from "./fileloader";
import { imageLoader } from "./imageloader";


export interface MeshAttribute {
  name: string;
  index: Uint16Array;
  vertex: Float32Array;
  texcoord: Float32Array;
  normal: Float32Array;
  images: {
    diff?: HTMLImageElement;
    spec?: HTMLImageElement;
    reflect?: HTMLImageElement;
  };
}

export interface MeshAttributeMap {
  index?: string;
  vertex: string;
  texcoord: string;
  normal?: string;
  images: {
    diff?: string;
    spec?: string;
    reflect?: string;
  };
}

export async function modelLoader(objPath: string, mtlPath?: string) {
  let objRes = await fileLoader(objPath);
  if (!objRes) {
    throw new Error(`获取 ${objRes} 失败`);
  }

  let mtlRes: Response | undefined;
  if (mtlPath) {
    mtlRes = await fileLoader(mtlPath);
    if (!mtlRes) {
      throw new Error(`获取 ${mtlPath} 失败`);
    }
  }

  let objBuffer = new Uint8Array(await objRes.arrayBuffer());
  let mtlBuffer;
  if (mtlRes) {
    mtlBuffer = new Uint8Array(await mtlRes.arrayBuffer());
  }
  //@ts-ignore
  let ajs = await assimpjs();
  let fileList = new ajs.FileList();
  fileList.AddFile(objPath, objBuffer);
  if (mtlPath && mtlBuffer) {
    fileList.AddFile(mtlPath, mtlBuffer);
  }
  let result = ajs.ConvertFileList(fileList, "assjson");
  if (!result.IsSuccess() || result.FileCount() == 0) {
  }
  let resultFile = result.GetFile(0);
  let jsonContent = new TextDecoder().decode(resultFile.GetContent());
  let scene: Assimpjs.Scene = JSON.parse(jsonContent);
  console.log(scene);
  let attributes: MeshAttribute[] = [];
  for (const m of scene.meshes) {
    let path = objPath.substring(0, objPath.lastIndexOf("/"));
    let diff = scene.materials[m.materialindex].properties.find((p) => {
      return p.semantic === 1 && p.type === 3;
    })?.value as string;
    let spec = scene.materials[m.materialindex].properties.find((p) => {
      return p.semantic === 2 && p.type === 3;
    })?.value as string;
    let ref = scene.materials[m.materialindex].properties.find((p) => {
      return p.semantic === 3 && p.type === 3;
    })?.value as string;
    attributes.push({
      vertex: new Float32Array(m.vertices),
      texcoord: new Float32Array(m.texturecoords[0]),
      normal: new Float32Array(m.normals),
      index: new Uint16Array(m.faces.flatMap((face) => face)),
      images: {
        diff: diff ? await imageLoader(`${path}/${diff}`) : undefined,
        spec: spec ? await imageLoader(`${path}/${spec}`) : undefined,
        reflect: ref ? await imageLoader(`${path}/${ref}`) : undefined,
      },
      name: m.name,
    });
  }

  return attributes;
}
