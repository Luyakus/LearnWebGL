
#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform int v_flag;
in vec2 a_texCoord;
out vec4 outColor;
const float ud = 80.0;
void main() {
  float radius = 0.2;
  vec2 origin = vec2(0.5, 0.5);
  vec2 xy = vec2(a_texCoord.x, a_texCoord.y);
  vec2 dxy = xy - origin;
  float dst = length(dxy);
  float angle = atan(dxy.x, dxy.y) + radians(ud) * (1.0 - (dst/radius) * (dst/radius));
  if (dst <= radius) {
   xy = vec2(radius, radius) + dst * vec2(cos(angle), sin(angle));
  }
  outColor = texture(u_image, vec2(xy.x, v_flag > 0 ? xy.y : -xy.y)).rgga;
}