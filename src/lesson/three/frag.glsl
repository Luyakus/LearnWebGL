#version 300 es
precision highp float;
out vec4 outColor;
in vec2 a_texCoord;
uniform sampler2D u_image;

void main() {
    outColor = texture(u_image, a_texCoord);
    // outColor = vec4(a_texCoord, 0, 1);
}