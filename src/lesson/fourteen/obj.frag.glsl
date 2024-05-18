#version 300 es

precision highp float;

uniform sampler2D texture0;
in vec2 a_texcoord;
out vec4 out_color;

void main() {
    // out_color = texture(texture0, a_texcoord);
    out_color = vec4(0, 0, 1, 1);
}
