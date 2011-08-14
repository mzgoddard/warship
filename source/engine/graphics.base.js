// 
// 
// var onload = l.dependOn(l.script('engine/graphics.base.js'));
// l.dependOn(
//   l.script('externals/class.js'),
//   l.text('shaders/basic.vsh'),
//   l.text('shaders/basic.fsh'),
//   l.script('engine/graphics.base.js'));

l.declare('engine/graphics.base.js');

l.dependOn(
  l.script('externals/class.js'),
  l.text('shaders/basic.vsh'),
  l.text('shaders/basic.fsh'),
function() {

var instance = null;
var gl = null;

var Graphics = Class.extend({
  init: function() {
    var canvas = document.getElementsByTagName('canvas')[0];
    var context = null;
    
    try {
      context = canvas.getContext('experimental-webgl');
    } catch (ex) {
      
    }
    
    this.onload = l._onload(this);
    
    this.gl = gl = context;
    this.shaders = [];
    this.shaderMap = {};
    
    l.dependOn(this.loadShader('shaders/basic'), bindSelf(function() {
      console.log('shader loaded');
      this.useShaderNamed('shaders/basic');
    }, this));
    l.dependOn(this.loadShader('shaders/basic'), this);
    l.dependOn(this, function(){
      console.log('Graphics initialized');
    });
  },
  useShader: function(id) {
    gl.useProgram(this.shaders[id]);
  },
  useShaderNamed: function(name) {
    gl.useProgram(this.shaderMap[name]);
  },
  loadShader: function(name) {
    if (this.shaderMap[name]) return this.shaderMap[name];
    
    var program = gl.createProgram();
    program.name = name;
    program.id = this.shaders.length;
    program.onload = l._onload(program);
    
    this.shaders.push(program);
    this.shaderMap[name] = program;
    
    program.shaders = [];
    
    this.compileShader(gl.VERTEX_SHADER, name + '.vsh', program);
    this.compileShader(gl.FRAGMENT_SHADER, name + '.fsh', program);
    
    return program;
  },
  compileShader: function(shaderType, path, program) {
    var shader = gl.createShader(shaderType);
    
    l.dependOn(
      l.text(path),
      bindSelf(function() {
        gl.shaderSource(shader, l.text(path).responseText);
        gl.compileShader(shader);
        gl.attachShader(program, shader);
        program.shaders.push(shader);
        if (program.shaders.length == 2) {
          this.linkShader(program);
        }
      }, this));
  },
  linkShader: function(program) {
    gl.linkProgram(program);
    program.onload();
  }
}, "Graphics");

Graphics.getInstance = function() {
  if (instance == null) {
    instance = new Graphics();
  }
  return instance;
};

return {
  Graphics: Graphics
};
});
