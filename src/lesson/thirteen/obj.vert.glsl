#version 300 es

uniform mat4x4 m_matrix;
uniform mat4x4 v_matrix;
uniform mat4x4 p_matrix;

in vec3 v_position;
in vec3 v_normal;

in vec2 v_texcoord;

out vec3 a_frag_position;
out vec3 a_normal;
out vec2 a_texcoord;

void main() {
    vec4 position = p_matrix * v_matrix * m_matrix * vec4(v_position, 1);
    gl_Position = position;
    a_frag_position = vec3(m_matrix * vec4(v_position, 1));
    a_texcoord = v_texcoord;
    a_normal = mat3(transpose(inverse(m_matrix))) * v_normal;
}
