(function() {
  var ImageUploader;

  ImageUploader = (function() {

    function ImageUploader(dialog) {
    this.reader, this.image_url, this.img;
    this.canvas = document.createElement("canvas");
    this.canvas_context = this.canvas.getContext('2d');
    
    this.rotateImage = function(direction, cb){      
      //These are swapped when rotating
      this.canvas.width = this.img.height;
      this.canvas.height = this.img.width;
      if(direction > 0){
        this.canvas_context.translate(this.canvas.width, this.canvas.height/this.canvas.width);
      }else{
        this.canvas_context.translate(this.canvas.width/this.canvas.height, this.canvas.height);
      }
      this.canvas_context.rotate(direction*Math.PI/2);
      this.canvas_context.drawImage(this.img, 0, 0);
      this.setImageFromDataURL(this.canvas.toDataURL("image/png"), this.img.alt, cb);
    }

    this.setImageFromDataURL = function(data_url, file_name, cb){
      var that = this;
      this.image_url = data_url
      this.img = new Image();
      this.img.src = this.image_url;
      this.img.onload = function () {
        that.img.alt = file_name;

        if(that.img.width>720){ //Scale down to 720px
          that.canvas.width = 720;
          that.canvas.height = that.img.height*720/that.img.width;
          that.canvas_context.drawImage(that.img, 0, 0, that.img.width, that.img.height, 0, 0, that.canvas.width, that.canvas.height);
          return that.setImageFromDataURL(that.canvas.toDataURL("image/png"), that.img.alt, cb);
        }
        console.log(that.img.width, that.img.height);
        that._dialog.populate(that.image_url, [that.img.width, that.img.height]);
        if(cb) {
          cb();
        }
      };
    }

    this.cropImage = function(crop_region, cb){
      this.canvas.width = this.img.width*crop_region[3];
      this.canvas.height = this.img.height*crop_region[2];
      this.canvas_context.translate(-this.img.width*crop_region[0], -this.img.height*crop_region[1]);
      this.canvas_context.drawImage(this.img, 0, 0);
      this.setImageFromDataURL(this.canvas.toDataURL("image/png"), this.img.alt, cb);
    }
    
    
    this._dialog = dialog;
    this._dialog.addEventListener('cancel', (function(_this) {
      return function() {
        return _this._onCancel();
      };
    })(this));
    this._dialog.addEventListener('imageuploader.cancelupload', (function(_this) {
      return function() {
        return _this._onCancelUpload();
      };
    })(this));
    this._dialog.addEventListener('imageuploader.clear', (function(_this) {
      return function() {
        return _this._onClear();
      };
    })(this));
    this._dialog.addEventListener('imageuploader.fileready', (function(_this) {
      return function(ev) {
        return _this._onFileReady(ev.detail().file);
      };
    })(this));
    this._dialog.addEventListener('imageuploader.mount', (function(_this) {
      return function() {
        return _this._onMount();
      };
    })(this));
    this._dialog.addEventListener('imageuploader.rotateccw', (function(_this) {
      return function() {
        return _this._onRotateCCW();
      };
    })(this));
    this._dialog.addEventListener('imageuploader.rotatecw', (function(_this) {
      return function() {
        return _this._onRotateCW();
      };
    })(this));
    this._dialog.addEventListener('imageuploader.save', (function(_this) {
      return function() {
        return _this._onSave();
      };
    })(this));
    this._dialog.addEventListener('imageuploader.unmount', (function(_this) {
      return function() {
        return _this._onUnmount();
      };
    })(this));
    }

    ImageUploader.prototype._onCancel = function() {};

    ImageUploader.prototype._onCancelUpload = function() {
      clearTimeout(this._uploadingTimeout);
      return this._dialog.state('empty');
    };

    ImageUploader.prototype._onClear = function() {
    this.img = null;
      return this._dialog.clear();
    };

    ImageUploader.prototype._onFileReady = function(file) {
    var _this=this;
      var reader = new FileReader();
      if (file){
        reader.readAsDataURL(file);
        reader.addEventListener('load', function(){
          _this.setImageFromDataURL(reader.result, file.name, function() {
            console.log("Image file loaded");
          });
        });
      }
    };

    ImageUploader.prototype._onMount = function() {};

    ImageUploader.prototype._onRotateCCW = function() {
      this.rotateImage(-1, function() {
        console.log("Image rotated CCW");
      });
    };

    ImageUploader.prototype._onRotateCW = function() {
     this.rotateImage(1, function() {
        console.log("Image rotated CW");
      });
    };

    ImageUploader.prototype._onSave = function() {
      var that = this;
      if (this._dialog.cropRegion()) {
            this.cropImage(this._dialog.cropRegion(), function() {
              that._dialog.save(
                that.image_url,
                [that.img.width, that.img.height],
                {
                    'alt': that.img.alt,
                    'data-ce-max-width': that.img.width
                }
              );
            });
      } else {
        this._dialog.save(
          this.image_url,
          [this.img.width, this.img.height],
          {
              'alt': this.img.alt,
              'data-ce-max-width': this.img.width
          }
        );
      }
    };

    ImageUploader.prototype._onUnmount = function() {};

    ImageUploader.createImageUploader = function(dialog) {
      return new ImageUploader(dialog);
    };

    return ImageUploader;

  })();

  window.ImageUploader = ImageUploader;

  function fixVideos() {
    var domains = ['www.youtube.com', 'youtu.be', 'vimeo.com', 'player.vimeo.com'];
    var iframeEls = document.getElementsByTagName('iframe');
    for(var i=0; i<iframeEls.length; i++) {
      var iframeSrc = iframeEls[i].src;
      var l = document.createElement("a");
      l.href = iframeSrc;
      if(domains.indexOf(l.hostname) == -1) {

      }
    }
  }

  window.onload = function() {
    var FIXTURE_TOOLS, IMAGE_FIXTURE_TOOLS, LINK_FIXTURE_TOOLS, editor, req;
    ContentTools.IMAGE_UPLOADER = ImageUploader.createImageUploader;
    ContentTools.StylePalette.add([new ContentTools.Style('By-line', 'article__by-line', ['p']), new ContentTools.Style('Caption', 'article__caption', ['p']), new ContentTools.Style('Example', 'example', ['pre']), new ContentTools.Style('Example + Good', 'example--good', ['pre']), new ContentTools.Style('Example + Bad', 'example--bad', ['pre'])]);
    editor = ContentTools.EditorApp.get();
    editor.init('[data-editable], [data-fixture]', 'data-name');
    editor.addEventListener('saved', function(ev) {
      var saved;
      console.log(ev.detail().regions);
      if (Object.keys(ev.detail().regions).length === 0) {
        return;
      }
      editor.busy(true);
      saved = (function(_this) {
        return function() {
          editor.busy(false);
          return new ContentTools.FlashUI('ok');
        };
      })(this);
      return setTimeout(saved, 2000);
    });
    FIXTURE_TOOLS = [['undo', 'redo', 'remove']];
    IMAGE_FIXTURE_TOOLS = [['undo', 'redo', 'image']];
    LINK_FIXTURE_TOOLS = [['undo', 'redo', 'link']];
    ContentEdit.Root.get().bind('focus', function(element) {
      var tools;
      if (element.isFixed()) {
        if (element.type() === 'ImageFixture') {
          tools = IMAGE_FIXTURE_TOOLS;
        } else if (element.tagName() === 'a') {
          tools = LINK_FIXTURE_TOOLS;
        } else {
          tools = FIXTURE_TOOLS;
        }
      } else {
        tools = ContentTools.DEFAULT_TOOLS;
      }
      if (editor.toolbox().tools() !== tools) {
        return editor.toolbox().tools(tools);
      }
    });
    /*req = new XMLHttpRequest();
    req.overrideMimeType('application/json');
    req.open('GET', 'https://raw.githubusercontent.com/GetmeUK/ContentTools/master/translations/lp.json', true);
    return req.onreadystatechange = function(ev) {
      var translations;
      if (ev.target.readyState === 4) {
        translations = JSON.parse(ev.target.responseText);
        ContentEdit.addTranslations('lp', translations);
        return ContentEdit.LANGUAGE = 'lp';
      }
    };*/
  };

}).call(this);