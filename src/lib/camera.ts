import { mat4, vec3 } from "gl-matrix";
import { degreesToRadians } from "../lesson/util";

export class Camera {
  position: vec3 = vec3.set(vec3.create(), 0, 0, 3);
  front: vec3 = vec3.set(vec3.create(), 0, 0, -1);
  up: vec3 = vec3.set(vec3.create(), 0, 1, 0);

  yaw: number = -90;
  pitch = 0;
  keys: string[] = [];

  constructor(canvas: HTMLCanvasElement) {
    if (window.innerWidth - canvas.getBoundingClientRect().width > 3) {
      return;
    }
    this.listenKeyboard();
    let listener = this.listenMouse.bind(this);
    document.addEventListener(
      "pointerlockchange",
      () => {
        if (document.pointerLockElement === canvas) {
          canvas.addEventListener("mousemove", listener);
        } else {
          canvas.removeEventListener("mousemove", listener);
        }
      },
      false
    );
    canvas.addEventListener("click", () => {
      canvas.requestPointerLock();
    });
  }

  listenKeyboard() {
    document.addEventListener("keydown", (ev) => {
      if (!this.keys.includes(ev.key)) {
        this.keys.push(ev.key);
      }
    });
    document.addEventListener("keyup", (ev) => {
      if (this.keys.includes(ev.key)) {
        this.keys = this.keys.filter((key) => key != ev.key);
      }
    });
  }

  listenMouse(ev: MouseEvent) {
    let xOffset = ev.movementX;
    let yOffset = -ev.movementY;

    let sensitivity = 0.04;
    xOffset *= sensitivity;
    yOffset *= sensitivity;

    this.yaw += xOffset;
    this.pitch += yOffset;
    if (this.pitch > 89) {
      this.pitch = 89;
    }
    if (this.pitch < -89) {
      this.pitch = -89;
    }
    let front = vec3.create();
    vec3.set(
      front,
      Math.cos(degreesToRadians(this.yaw)) *
        Math.cos(degreesToRadians(this.pitch)),
      Math.sin(degreesToRadians(this.pitch)),
      Math.sin(degreesToRadians(this.yaw)) *
        Math.cos(degreesToRadians(this.pitch))
    );
    vec3.normalize(this.front, front);
  }

  move(interval: number) {
    let speed = interval * 1;
    if (this.keys.includes("w")) {
      let up = vec3.create();
      vec3.add(
        this.position,
        this.position,
        vec3.set(
          up,
          this.front[0] * speed,
          this.front[1] * speed,
          this.front[2] * speed
        )
      );
    } else if (this.keys.includes("s")) {
      let down = vec3.create();
      vec3.subtract(
        this.position,
        this.position,
        vec3.set(
          down,
          this.front[0] * speed,
          this.front[1] * speed,
          this.front[2] * speed
        )
      );
    } else if (this.keys.includes("a")) {
      let left: vec3 = vec3.create();
      vec3.normalize(left, vec3.cross(left, this.front, this.up));
      vec3.set(left, left[0] * speed, left[1] * speed, left[2] * speed);
      vec3.subtract(this.position, this.position, left);
    } else if (this.keys.includes("d")) {
      let right: vec3 = vec3.create();
      vec3.normalize(right, vec3.cross(right, this.front, this.up));
      vec3.set(right, right[0] * speed, right[1] * speed, right[2] * speed);
      vec3.add(this.position, this.position, right);
    }
  }

  cameraMatrix() {
    let matrix = mat4.create();
    let target = vec3.create();
    mat4.lookAt(
      matrix,
      this.position,
      vec3.add(target, this.position, this.front),
      this.up
    );
    return matrix;
  }
}
