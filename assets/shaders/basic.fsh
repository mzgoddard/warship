uniform lowp sampler2D texture0;

varying highp vec2 v_texcoord0;
varying lowp vec4 v_color;

void main() {
  // gl_FragColor = texture2D(texture0, vec2(0.0625, 0.0625));
  gl_FragColor = texture2D(texture0, v_texcoord0.st) * v_color;
  // gl_FragColor = vec4(v_texcoord0, 0, 1);
}