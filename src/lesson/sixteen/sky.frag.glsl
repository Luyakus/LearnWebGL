#version 300 es

precision highp float;

in vec3 a_texcoord;

uniform samplerCube skybox;

out vec4 out_color;

void main() {
    out_color = texture(skybox, a_texcoord);
}