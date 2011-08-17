(function(window) {
  var emptyFunc = function(){};
  // var XHRProxy = function(src){
  //   this.source = src;
  //   this.onload = emptyFunc;
  // };
  Object.extend = function(a, b) {
    for (var key in b) {
      a[key] = b[key];
    }
    return a;
  };
  
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(f) {
      for (var i = 0, l = this.length; i < l; i++) {
        f(this[i], i, this);
      }
    };
  }
  
  Object.extend(Array.prototype, {
    remove: function(value) {
      for (var i in this) {
        if (this[i] == value) {
          this.removeAt(i);
          break;
        }
      }
    },
    removeFast: function(obj) {
      this.removeAtIndexFast(this.indexOf(obj));
    }, // removeFast
    removeAt: function(index) {
      if (index > this.length / 2) {
        for (var i = index, l = this.length - 1; i < l; i++) {
          this[i] = this[i+1];
        }
        this.pop();
      } else {
        for (var i = index; i > 0; i--) {
          this[i] = this[i-1];
        }
        this.shift();
      }
    },
    removeAtIndex: Array.prototype.removeAt,
    removeLastObject: function() {
      this.pop();
    },
    removeAtIndexFast: function(index) {
      this[index] = this[this.length-1];
      this.pop();
    },
    clear: function() {
      while (this.length > 0) {
        this.pop();
      }
    },
    removeAll: Array.prototype.clear,
    swap: function(i, j) {
      var temp = this[i];
      this[i] = this[j];
      this[j] = temp;
    },
    contains: function(obj) {
      return this.indexOf(obj) != -1;
    }
  });
  
  window.guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  };
  
  window.bindSelf = function(f, self) {
    return function(){
      return f.apply(self, arguments);
    };
  };
  
  var Loader = function(){
    this.init();
  };
  Loader.prototype = {
    init: function(options) {
      this.options = options = options || {};
      
      this.loaded = {};
      this.depends = {};
      this.reverseDepends = {};
    },
    _onload: function(obj) {
      return bindSelf(function(ev, loader) {
        // this.loaded[obj.src] = obj;
        obj.loaded = true;
        
        if (obj._guid && this.reverseDepends[obj._guid]) {
          setTimeout(bindSelf(function(){
            if (this.depends[obj._guid] == undefined || this.depends[obj._guid].length == 0) {
              var reverseDepends = this.reverseDepends[obj._guid];
              delete this.reverseDepends[obj._guid];
          
              reverseDepends.forEach(bindSelf(function(o2) {
                this.depends[o2._guid].remove(obj);
                var depends = this.depends[o2._guid];
                if (depends.length == 0) {
                  setTimeout(bindSelf(function() {
                    if (depends.length == 0) {
                      if (o2 instanceof Function) {
                        o2(obj);
                      } else if (o2.onload) {
                        o2.onload(obj);
                        delete o2.onload;
                      }
                      delete this.depends[o2._guid];
                    }
                  }, this), 0);
                }
              }, this));
            }
          }, this), 0);
        }
      }, this);
    },
    _correctSource: function(src, options) {
      if (options.isContent) {
        src = (this.contentPrefix || "") + src;
      }
      return src;
    },
    image: function(src) {
      src = this._correctSource(src, {isContent: true});
      
      if (this.loaded[src]) return this.loaded[src];
      
      var image = new Image();
      
      image.onload = this._onload(image);
      image.src = src;
      
      this.loaded[src] = image;
      
      return image;
    },
    text: function(src) {
      src = this._correctSource(src, {isContent: true});
      
      if (this.loaded[src]) return this.loaded[src];
      
      var xhr = new XMLHttpRequest();
      
      xhr.src = src;
      xhr.onload = this._onload(xhr);
      xhr.open('GET', src);
      xhr.send();
      
      this.loaded[src] = xhr;
      
      return xhr;
    },
    script: function(src) {
      if (this.options.fakeScript) this.loaded[src] = {loaded: true};
      
      if (this.loaded[src]) return this.loaded[src];
      
      var script = document.createElement('script');
      
      script.onload = this._onload(script);
      script.src = src;
      
      document.head.appendChild(script);
      
      this.loaded[src] = script;
      
      return script;
    },
    // module: function(src) {
    //   
    // },
    // _initModule: function(src, exports) {
    //   
    // },
    declare: function(src) {
      this.nextModuleSrc = src;
    },
    _dependOn: function(depArray, obj) {
      depArray.forEach(bindSelf(function(dependency) {
        if (!dependency._guid) dependency._guid = guid();
        if (!obj._guid) obj._guid = guid();
        
        if (!this.depends[obj._guid]) this.depends[obj._guid] = [dependency];
        else this.depends[obj._guid].push(dependency)
        
        if (!this.reverseDepends[dependency._guid]) 
          this.reverseDepends[dependency._guid] = [obj];
        else this.reverseDepends[dependency._guid].push(obj);
        
        // console.log(obj._guid, typeof obj == "object" ? obj : typeof obj, this.depends[obj._guid].length);
        // console.log.apply(window, this.depends[obj._guid]);
        
        if (dependency.loaded) {
          this._onload(dependency)();
        }
      }, this));
    },
    dependOn: function(dependenciesCommaSeparated, obj) {
      var dependencies = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
      var obj = arguments[arguments.length - 1];
      
      // if (obj instanceof Array) {
      //   obj.forEach(bindSelf(function(o){
      //     var args = [];
      //     dependencies.forEach(function(d){args.push(d);});
      //     args.push(o);
      //     this.dependOn.apply(this, args);
      //   }, this));
      //   return;
      // }
      
      if (this.nextModuleSrc) {
        if (obj instanceof Function) {
          this._dependOn(dependencies, (bindSelf(function(module) {
              return bindSelf(function() {
            var lateObject = {};
            lateObject.onload = this._onload(lateObject);
            this._dependOn([lateObject], module);
            var ret;
            var initFunc = function(exports) {
              module.exports = exports;
              lateObject.onload();
            };
            ret = obj(initFunc);
            if (ret) {
              initFunc(ret);
            }
          }, this);}, this))(this.script(this.nextModuleSrc)));
        } else {
          this._dependOn(dependencies, obj);
        }
        this._dependOn(dependencies, this.script(this.nextModuleSrc));
        delete this.nextModuleSrc;
      } else {
        this._dependOn(dependencies, obj);
      }
      
      if (arguments.length == 1) {
        // return this._onload(obj);
        var d = {};
        this.dependOn(d, obj);
        // console.log('function', d._guid);
        return this._onload(d);
      }
      
      return dependencies[0];
    }
  };
  
  window.loader = window.l = new Loader();
  
})(window);
