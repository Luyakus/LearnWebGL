#version 300 es



uniform mat4x4 m_matrix;
uniform mat4x4 v_matrix;
uniform mat4x4 p_matrix;

in vec3 v_position;

void main() {
    gl_Position = p_matrix * v_matrix * m_matrix * vec4(v_position, 1);
}