#version 300 es

in vec3 v_position;
uniform mat4x4 m_matrix;
uniform mat4x4 v_matrix;
uniform mat4x4 p_matrix;

void main() {
    gl_Position = vec4(v_position, 1);
}