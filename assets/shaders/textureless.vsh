uniform mat4 modelview_projection;

attribute vec3 a_position;
attribute vec4 a_color;

varying vec4 v_color;

void main() {
  gl_Position = modelview_projection * vec4(a_position, 1);
  // gl_Position = vec4(a_position, 1);
  
  v_color = a_color;
}