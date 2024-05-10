#version 300 es

precision highp float;

uniform sampler2D u_image;


in vec2 a_texcoord;
out vec4 out_color;

void main() {
    out_color = texture(u_image, a_texcoord);
}