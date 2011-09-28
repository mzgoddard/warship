l.declare('engine/graphics.base.js')
 .dependOn(
    l.script('externals/class.js'),
    l.script('externals/glmatrix.js'),
    l.script('externals/sizzle.js'),
    l.text('shaders/basic.vsh'),
    l.text('shaders/basic.fsh'),
    l.text('shaders/textureless.vsh'),
    l.text('shaders/textureless.fsh'),
function(init) {

var instance = null;
var gl = null;

var Graphics = Class.extend({
  init: function(sel) {
    var canvas = Sizzle(sel || 'canvas')[0];
    var context = null;
    
    try {
      context = canvas.getContext('experimental-webgl');
    } catch (ex) {
      
    }
    
    this.onload = l._onload(this);
    
    this.canvas = canvas;
    this.gl = gl = context;
    this.shaders = [];
    this.shaderMap = {};
    
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    this.projectionMatrix = mat4.create();
    this.resize();
  
    this.modelviewMatrix = mat4.identity(mat4.create());
    this.matrixStack = [];
    
    this.modelviewProjection = mat4.create();
    
    l.dependOn(this.loadShader('shaders/basic'), bindSelf(function() {
      console.log('shader loaded');
      this.useShaderNamed('shaders/basic');
    }, this));
    l.dependOn(this.loadShader('shaders/basic'), this);
    l.dependOn(this, function(){
      console.log('Graphics initialized');
    });
  },
  // avoid use unless low-level code seems broken
  // debug: {
  //   get: function() {
  //     return false;
  //   },
  //   set: function(v) {
  //     if (!this._debug && v) {
  //       var getError = gl.getError;
  //       for (var k in this.gl) {
  //         (function() {
  //           var key = k;
  //           var func = this.gl[key];
  //           if (typeof func == 'function') {
  //             this.gl[key] = bindSelf(function() {
  //               var ret = func.apply(this.gl, arguments);
  //               var err = getError.apply(this.gl);
  //               console.info(key, arguments, '->', ret, err);
  //               return ret;
  //             }, this);
  //           }
  //         }).call(this);
  //       }
  //     }
  //     
  //     this._debug = v;
  //   },
  // },
  resize: function() {
    var width = parseInt(this.canvas.width);
    var height = parseInt(this.canvas.height);
    
    this.gl.viewport(0, 0, width, height);
    
    mat4.identity(this.projectionMatrix);
    // mat4.perspective(
    //   60,
    //   width/height,
    //   0, 1000,
    //   this.projectionMatrix);
    // mat4.ortho(
    //   -width / 2,
    //   width / 2,
    //   height / 2,
    //   -height / 2,
    //   0,
    //   1000,
    //   this.projectionMatrix);
  },
  pushMatrix: function() {
    this.matrixStack.push(mat4.create(
      this.modelviewMatrix
    ));
  },
  popMatrix: function() {
    mat4.set(this.matrixStack.pop(), this.modelviewMatrix);
  },
  activeShader: {
    get: function() {return this._activeShader;},
    set: function(v) {
      if (v != this._activeShader) {
        this._activeShader=v;
        gl.useProgram(v);
      }
    }
  },
  useShader: function(id) {
    this.activeShader = this.shaders[id];
  },
  useShaderNamed: function(name) {
    this.activeShader = this.shaderMap[name];
  },
  loadShader: function(name, attribKeys, uniformKeys) {
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
        
        var status = gl.getShaderInfoLog(shader);
        if (status) {
          console.error(path, status);
        }
        
        gl.attachShader(program, shader);
        program.shaders.push(shader);
        if (program.shaders.length == 2) {
          this.linkShader(program);
        }
      }, this));
  },
  linkShader: function(program) {
    gl.linkProgram(program);
    
    var status = gl.getProgramInfoLog(program);
    if (status) {
      console.error(program.name, status);
    }
    
    program.onload();
    
    program.attributes = new Array(gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
    program.attributeTypeMap = new Array(Graphics.ValueType.Count);
    program.attributeMap = {};
    
    var attribKeys = ['position', 'color', 'texcoord0'];
    for (var i = 0; i < attribKeys.length; i++) {
      var attrib = gl.getAttribLocation(program, 'a_' + attribKeys[i]);
      if (attrib !== null) {
        program.attributes[attrib] = attribKeys[i];
        program.attributeTypeMap[i] = attrib;
        program.attributeMap[attribKeys[i]] = i;
      }
    }
    
    program.uniforms = new Array(Graphics.Uniforms.Count);
    program.uniformMap = {};
    
    var uniformKeys = ['modelview_projection', 'texture0'];
    for (i = 0; i < uniformKeys.length; i++) {
      var uniform = gl.getUniformLocation(program, uniformKeys[i]);
      if (uniform !== null) {
        program.uniforms[i] = uniform;
        program.uniformMap[uniformKeys[i]] = uniform;
        
        if (uniformKeys[i] == 'texture0') {
          gl.uniform1i(uniform, 0);
        }
      }
    }
  },
  getShaderAttrib: function(index) {
    return this.activeShader.attributes[index];
  },
  getShaderAttribWithName: function(name) {
    return this.activeShader.attributeMap[name];
  },
  setData: function(arrays) {
    for (var i = 0; i < arguments.length; i++) {
      var array = arguments[i];
      
    }
  },
  draw: function(primitive, offset, count) {
    
  },
  buffer: function() {
    return new Buffer(this);
  }
}, "Graphics");

var Buffer = Class.extend({
  init: function(graphics) {
    this.context = graphics;
    
    this.handle = graphics.gl.createBuffer();
  },
  destroy: function() {
    this.context.gl.deleteBuffer(this.handle);
  },
  load: function(array, usage) {
    var gl = this.context.gl;
    
    this.array = array;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.handle);
    gl.bufferData(gl.ARRAY_BUFFER, this.array, usage || Buffer.Usage.Dynamic);
    
    return this;
  },
  bind: function() {
    var gl = this.context.gl;
    var shader = this.context.activeShader;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.handle);
    
    var numBytes = this.array.__proto__.BYTES_PER_ELEMENT;
    
    for (var i = 0; i < this.array.packing.length; i++) {
      var pack = this.array.packing[i];

      if (shader.attributeTypeMap[pack[0]] >= 0) {
        gl.enableVertexAttribArray(
          shader.attributeTypeMap[pack[0]]);
        gl.vertexAttribPointer(
          shader.attributeTypeMap[pack[0]],
          pack[1],
          gl.FLOAT,
          pack[3],
          this.array.stride * numBytes,
          pack[2] * numBytes);
        // console.log(
        //   shader.attributeTypeMap[pack[0]],
        //   pack[1],
        //   gl.FLOAT,
        //   pack[3],
        //   this.array.stride * numBytes,
        //   pack[2] * numBytes);
      }
    }
    
    return this;
  },
  draw: function(primitive, first, count) {
    var ctx = this.context
      , gl = ctx.gl
      , shader = ctx.activeShader;
    
    mat4.multiply(ctx.projectionMatrix, ctx.modelviewMatrix, ctx.modelviewProjection);
    gl.uniformMatrix4fv(
      shader.uniforms[Graphics.Uniforms.ModelviewProjection],
      false,
      ctx.modelviewProjection)
    gl.drawArrays(primitive, first || 0, count || this.array.size);
    
    return this;
  },
  triangles: function(first, count) {
    return this.draw(this.context.gl.TRIANGLES, first, count);
  },
  triangleStrip: function(first, count) {
    return this.draw(this.context.gl.TRIANGLE_STRIP, first, count);
  }
});

Object.extend(Buffer, {
  Usage: {
    Stream: 0x88E0, // gl.STREAM_DRAW
    Static: 0x88E4, // gl.STATIC_DRAW
    Dynamic: 0x88E8, // gl.DYNAMIC_DRAW
  }
});

// static values and functions
Object.extend(Graphics, {
  ValueType: {
    Vertex: 0,
    Color: 1,
    TexCoord: 2,
    Count: 3
  },
  NormalizedType: [
    false, // Vertex
    false, // Color
    false, // TexCoord
  ],
  AttribLocations: [
    'position',
    'color',
    'texcoord0'
  ],
  Uniforms: {
    ModelviewProjection: 0,
    Texture0: 1,
    Count: 2
  },
  array: function(type, count, valueType, size, values) {
    var totalSize = 0;
    
    var packing = [];
    
    var argSets = [];
    for (var i = 2; i < arguments.length; i += 3) {
      totalSize += arguments[i+1];
      // valueType, size, values
      argSets.push([arguments[i],arguments[i+1],arguments[i+2]]);
      // valueType, size, offset (later)
      packing.push([arguments[i],arguments[i+1]]);
    }
    
    var array = new type(totalSize * count);
    array.size = count;
    array.packing = packing;
    
    var offset = 0;
    for (i = 0; i < argSets.length; i++) {
      array.packing[i].push(offset);
      array.packing[i].push(Graphics.NormalizedType[argSets[i][0]]);
      
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
    
    if (argSets.length > 1) {
      array.stride = offset;
    } else {
      array.stride = 0;
    }
    
    return array;
  }, // array
  colorArray: function(count, values) {
    return Graphics.array(
      Uint8Array, 
      count, 
      Graphics.ValueType.Color, 
      4, 
      values);
  },
  // vertexArray: function(count, size, values) {
  //   var array = new Float32Array(size * count);
  // }
  getInstance: function(sel) {
    if (instance == null) {
      instance = new Graphics(sel);
    }
    return instance;
  },
  buffer: function() {
    return new Buffer(this.getInstance());
  }
});

Object.extend(Loader.prototype, {
  shader: function(path) {
    if (this.loaded[path]) {
      return this.loaded[path];
    }
    
    var shader = Graphics.getInstance().loadShader(path);
    this.declare(path, function(init) {
      this.dependOn(shader, function() {
        init(shader);
      });
    });
    
    return shader;
  } // shader
});

return {
    Graphics: Graphics,
    Buffer: Buffer
  };
});
