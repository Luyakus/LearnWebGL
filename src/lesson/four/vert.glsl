#version 300 es

in vec2 v_position;
in vec2 v_texcoord;
out vec2 a_texcoord;

void main() {
    gl_Position = vec4(v_position, 0, 1);
    a_texcoord = v_texcoord;
}