#version 300 es

in vec2 v_position;
in vec2 v_texCoord;

out vec2 a_texCoord;

void main() {
    gl_Position = vec4(v_position, 0, 1);
    a_texCoord = v_texCoord;
}