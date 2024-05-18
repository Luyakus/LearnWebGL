#version 300 es

precision highp float;

uniform sampler2D dif_texture;
uniform sampler2D spec_texture;
in vec2 a_texcoord;
out vec4 out_color;

void main() {
    out_color =  texture(spec_texture, a_texcoord) + texture(dif_texture, a_texcoord);
    // out_color = vec4(0, 0, 1, 1);
}
