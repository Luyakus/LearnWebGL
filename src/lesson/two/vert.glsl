#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position.x, -a_position.y, 0, 1);
  v_texCoord = vec2(a_texCoord.x, a_texCoord.y);
}