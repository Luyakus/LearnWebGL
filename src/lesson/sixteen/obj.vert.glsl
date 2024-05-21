#version 300 es

in vec3 v_position;
in vec3 v_normal;
in vec2 v_texcoord;


out vec3 a_normal;
out vec3 a_position;
out vec2 a_texcoord;
uniform mat4x4 m_matrix;
uniform mat4x4 v_matrix;
uniform mat4x4 p_matrix;

void main() {
    vec4 position = m_matrix * vec4(v_position, 1);
    gl_Position = p_matrix * v_matrix * position;
    a_normal = mat3(transpose(inverse(m_matrix))) * v_normal;
    a_position = position.xyz;
    a_texcoord = v_texcoord;
}
