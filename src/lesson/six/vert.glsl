#version 300 es

uniform mat4x4 p_matrix;
uniform mat4x4 v_matrix;
uniform mat4x4 m_matrix;

in vec3 v_position;
in vec2 v_texcoord;
out vec2 a_texcoord;

void main() {
    gl_Position = p_matrix * v_matrix * m_matrix * vec4(v_position, 1);
    a_texcoord = v_texcoord;
}