declare module Assimpjs {
  interface MaterialProperty {
    key: string;
    semantic: number;
    index: number;
    type: number;
    value: string | number | number[];
  }

  interface Meterial {
    properties: MaterialProperty[];
  }

  interface Mesh {
    faces: number[3][];
    meterialIndex: number;
    name: string;
    normals: number[];
    texturecoords: number[];
    vertices: number[];
  }

  interface Scene {
    meterials: Meterial[];
    meshes:Mesh[];
  }
}
