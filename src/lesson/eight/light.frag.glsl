#version 300 es

precision highp float;

uniform vec3 light_color;
out vec4 out_color;

void main() {
    out_color = vec4(light_color, 1);
}
