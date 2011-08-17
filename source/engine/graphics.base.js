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
    
    gl.getAttribLocation(program.
  },
  setData: function(arrays) {
    for (var i = 0; i < arguments.length; i++) {
      var array = arguments[i];
      
    }
  },
  draw: function(primitive) {
    
  }
}, "Graphics");

// static values and functions
Object.extend(Graphics, {
  ValueType: {
    Vertex: 0,
    Color: 1,
    TexCoord: 2,
  },
  AttribLocations: [
    'position',
    'color',
    'texcoord0'
  ],
  array: function(type, count, valueType, size, values) {
    var totalSize = 0;
    
    var packing = [];
    
    var argSets = [];
    for (var i = 2; i < arguments.length; i += 3) {
      totalSize += arguments[i+1];
      argSets.push([arguments[i],arguments[i+1],arguments[i+2]]);
      packing.push([arguments[i],arguments[i+1]]);
    }
    
    var array = new type(totalSize * count);
    array.packing = packing;
    
    var offset = 0;
    for (i = 0; i < argSets.length; i++) {
      array.packing[i].push(offset);
      
      var size = argSets[i][1];
      var values = argSets[i][2];
      if (values) {
        if (values.length == argSets[i][1]) {
          for (var j = 0, l = size * count; j < l; j++) {
            array[Math.floor(j / size) * totalSize + offset + j % size] = values[j % size];
          }
        } else {
          for (var j = 0, l = values.length; j < l; j++) {
            array[Math.floor(j / size) * totalSize + offset + j % size] = values[j];
          }
        }
      }
      
      offset += array.packing[i][1];
    }
    
    if (argSets.length > 0) {
      array.stride = offset;
    } else {
      array.stride = 0;
    }
    
    return array;
  },
  colorArray: function(count, values) {
    return Graphics.array(Uint8Array, count, Graphics.ValueType.Color, 4, values);
  }
  // vertexArray: function(count, size, values) {
  //   var array = new Float32Array(size * count);
  // }
});

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
