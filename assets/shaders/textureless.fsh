varying lowp vec4 v_color;

void main() {
  gl_FragColor = v_color.rgba;
  // gl_FragColor = vec4(1,1,1,1);
}