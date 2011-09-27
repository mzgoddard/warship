l.declare('engine/texture.js');
l.dependOn(
  l.script('externals/class.js'),
  l.script('engine/graphics.base.js'),
function() {

var Graphics = l.script('engine/graphics.base.js').Graphics;

var Texture = Class.extend({
  init: function(context, path) {
    Texture.init();
    
    var graphics = context
      , gl = graphics.gl;
    
    this.context = context;
    this.handle = gl.createTexture();
    
    this.onload = loader._onload(this);
    
    if (path) {
      this.fromFile(path);
    } else {
      this.onload();
    }
  },
  // Property: clamp
  // boolean
  clamp: {
    get: function() {
      return Boolean(this._clamp);
    },
    set: function(v) {
      this._clamp=v;
    }
  },
  destroy: function() {
    gl.deleteTexture(this.handle);
  },
  fromFile: function(path) {
    var onload = loader.dependOn(this);
    
    this.data = loader.image(path);
    loader.dependOn(this.data, bindSelf(function() {
      var graphics = this.context
        , gl = graphics.gl;
      
      gl.bindTexture(gl.TEXTURE_2D, this.handle);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D, 
        0, 
        gl.RGBA, 
        gl.RGBA, 
        gl.UNSIGNED_BYTE, 
        this.data);
      
      onload();
      // },this),0);
    }, this));
  },
  bind: function(unit) {
    var gl = this.context.gl
      , shader = this.context.activeShader;
    
    gl.activeTexture(unit || gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.handle);
    gl.uniform1i(shader.uniforms[Graphics.Uniforms.Texture0], (unit || gl.TEXTURE0) - gl.TEXTURE0);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._clamp ? gl.CLAMP_TO_EDGE : gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._clamp ? gl.CLAMP_TO_EDGE : gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  }
});

Object.extend(Texture, {
  init: function() {
    
  }
});

Loader.define({
  texture: function(src, options) {
    return new Texture(Graphics.getInstance(), options.originalSource);
  }
});

return {
  Texture: Texture
};

});