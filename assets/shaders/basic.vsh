uniform mat4 modelview_projection;

attribute vec4 a_position;
attribute vec2 a_texcoord0;
attribute vec4 a_color;

varying vec2 v_texcoord0;
varying vec4 v_color;

void main() {
  gl_Position = modelview_projection * a_position;
  
  v_texcoord = a_texcoord;
  v_color = a_color;
}