#version 300 es

uniform mat4 v_matrix;
uniform mat4 p_matrix;

in vec3 v_position;
out vec3 a_texcoord;

void main() {
    gl_Position = (p_matrix *  v_matrix * vec4(v_position, 1)).xyww;
    a_texcoord = v_position;
}