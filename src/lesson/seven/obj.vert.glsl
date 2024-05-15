#version 300 es

uniform mat4x4 m_matrix;
uniform mat4x4 v_matrix;
uniform mat4x4 p_matrix;

in vec3 v_position;
in vec3 v_normal;

out vec3 a_frag_position;
out vec3 a_normal;

void main() {
    a_normal = mat3(transpose(inverse(m_matrix))) * v_normal;
    a_frag_position = vec3(m_matrix * vec4(v_position, 1));
    gl_Position = p_matrix * v_matrix * vec4(a_frag_position, 1);
}