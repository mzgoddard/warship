uniform mat4 modelview_projection;

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_texcoord0;

varying highp vec2 v_texcoord0;
varying lowp vec4 v_color;

void main() {
  gl_Position = modelview_projection * a_position;
  
  v_texcoord0 = a_texcoord0;
  v_color = a_color;
}