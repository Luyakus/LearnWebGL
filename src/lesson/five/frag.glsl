#version 300 es

precision highp float;
in vec2 a_texcoord;
uniform sampler2D u_image;

out vec4 out_color;

void main() {
    out_color = texture(u_image, a_texcoord);
}