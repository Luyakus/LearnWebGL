#version 300 es

in vec3 v_position;
in vec2 v_texcoord;
in vec3 v_normal;

uniform mat4x4 m_matrix;
uniform mat4x4 v_matrix;
uniform mat4x4 p_matrix;

out vec2 a_texcoord;
out vec3 a_normal;
out vec3 a_frag_position;

void main() {
    gl_Position = p_matrix * v_matrix * m_matrix * vec4(v_position, 1);
    a_texcoord = vec2(v_texcoord.x, -v_texcoord.y);
    a_normal = mat3(transpose(inverse(m_matrix))) * v_normal;
    a_frag_position = vec3(m_matrix * vec4(v_position, 1));

}