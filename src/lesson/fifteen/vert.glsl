#version 300 es

in vec3 v_position;
in vec2 v_texcoord;
out vec2 a_texcoord;

uniform mat4x4 m_matrix;
uniform mat4x4 v_matrix;
uniform mat4x4 p_matrix;

void main() {
    gl_Position = p_matrix * v_matrix * m_matrix * vec4(v_position, 1);
    a_texcoord = v_texcoord;
}