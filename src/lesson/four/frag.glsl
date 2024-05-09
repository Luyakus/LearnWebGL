#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform sampler2D u_image1;
in vec2 a_texcoord;
out vec4 out_color;

void main() {
    // if(a_texcoord.x > a_texcoord.y) {
    //     out_color = texture(u_image, a_texcoord);
    // } else {
    //     out_color = texture(u_image1, a_texcoord);
    // }

    out_color = texture(u_image, a_texcoord) *  texture(u_image1, a_texcoord);;
}