#version 300 es

in vec3 v_position;
in vec3 v_normal;
in vec2 v_texcoord;
in mat4x4 m_matrix;

uniform mat4x4 rotate_matrix;
uniform mat4x4 v_matrix;
uniform mat4x4 p_matrix;

out vec2 a_texcoord;

void main() {
    a_texcoord = v_texcoord;
    gl_Position = p_matrix * v_matrix * rotate_matrix * m_matrix * vec4(v_position, 1);
}