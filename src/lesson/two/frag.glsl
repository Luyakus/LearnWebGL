#version 300 es
precision highp float;
uniform sampler2D u_image;
in vec2 v_texCoord;
out vec4 outColor;
void main() {
  float step_size = 0.004;
  outColor = texture(u_image, vec2(floor(v_texCoord.x/step_size) * step_size, floor(v_texCoord.y/step_size) * step_size)).brga;
}