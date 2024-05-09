#version 300 es

in vec3 v_position;
uniform mat4 pv_mat4;
uniform mat4 m_mat4;
in vec2 v_texcoord;
out vec2 a_texcoord;


void main(){
    gl_Position = pv_mat4 * m_mat4 * vec4(v_position, 1);
    a_texcoord = v_texcoord;
}
