#version 300 es
precision highp float;
out vec4 outColor;
in vec2 a_texCoord;
uniform sampler2D u_image;

void main() {
  float step_size = 0.001;
  outColor = texture(u_image, vec2(floor(a_texCoord.x/step_size) * step_size, floor(a_texCoord.y/step_size) * step_size)).brga;
}