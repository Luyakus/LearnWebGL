#version 300 es

in vec3 v_position;
uniform mat4 v_mat4;
in vec2 v_texcoord;
out vec2 a_texcoord;


void main(){
    gl_Position = v_mat4 * vec4(v_position, 1);
    a_texcoord = v_texcoord;
}
