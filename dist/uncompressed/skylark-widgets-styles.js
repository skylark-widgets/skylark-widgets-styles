/**
 * skylark-widgets-styles - The skylark style widgets library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-styles/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-widgets-styles/styles',[
	"skylark-langx/skylark"
],function(skylark){
	return skylark.attach("widgets.styles",{});
});
define('skylark-widgets-styles/colorpane.tpl',[],function(){
    return (function () {
        return [
            "<div class='sp-container'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                    "<div class='sp-palette-button-container sp-cf'>",
                        "<button type='button' class='sp-palette-toggle'></button>",
                    "</div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button type='button' class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();	
 });
define('skylark-widgets-styles/color-chooser',[
	"skylark-langx/langx",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-plugins-popups",
	"skylark-graphics-colors/Color",
	"skylark-domx-plugins-colors/ColorPane",
	"skylark-widgets-base/widget",
	"./styles",
	"./colorpane.tpl"
],function(
	langx,
	$,
	eventer,
	popups,

	Color,
	ColorPane,
	Widget,
	styles,
	colorPaneTbl
){
	"use strict";

	var ColorChooser = Widget.inherit({
		"klassName" : "ColorChooser",

		"_construct" : function (parent) 	{
			Widget.prototype._construct.call(this, parent, "input");

			this._elm.type = "text";
			this._elm.style.outline = "none";
			this._elm.style.borderStyle = "none";
			this._elm.style.boxSizing = "border-box";
			this._elm.style.textIndent = "4px";
			this._elm.style.borderRadius = "4px";
			this._elm.style.boxShadow = "none";
			this._elm.style.MozAppearance = "textfield";
			this._elm.style.webkitAppearance = "caret";
			this._elm.style.appearance = "textfield";

			/**
			 * Color chooser.
			 *
			 * @attribute color
			 * @type {jscolor}
			 */


			 var self = this;

			 this.listenTo(this._velm,"change",function(){
			 	self._value = Color.parse(self._velm.val());
			 	self.emit("change",self._value);
			 });



			 this.$pane = $(colorPaneTbl);
			 $("body").append(this.$pane);
			 this._picker = ColorPane.instantiate(this.$pane[0],{
                //color : opts.color
			    pane : {
		            states : {
		                showInput: false
		            }            
		        }					 	
             });

			 this.listenTo(this._picker,"change",function(){
			 	self._value = Color.parse(self._velm.val());
			 	self.emit("change",self._value);
			 });


            var paneIsVisible = true;
            function showPane() {
                if (paneIsVisible) {
                    return;
                }
               
                paneIsVisible = true;

                self.$pane.show();

            	self.$pane.css("position", "absolute");
                self.$pane.offset(popups.calcOffset(self.$pane[0], self._elm));
                
            }

            function hidePane() {
                if (!paneIsVisible) {
                    return;
                }
                paneIsVisible = false;

                self.$pane.hide();
            }
            hidePane();

            this.listenTo(this._velm,"click touchstart", function (e) {
                if (paneIsVisible) {
                    hidePane();
                } else {
                    showPane();
                }

              eventer.stop(e);
            });

            this.listenTo(this._picker,"picked",(e,color) => {
            	self._value = color;
                self._velm.css("background-color", color.toRgbString());   
                self._velm.val(color.toHexString());     
                self.emit("change",color);       
            });

            this.listenTo(this._picker,"canceled choosed",(e) => {
                hidePane();
            });

			/*
			this.color = new jscolor(this.element);
			this.color.backgroundColor = Editor.theme.boxColor;
			this.color.insetColor = Editor.theme.boxColor;
			this.color.shadow = false;
			this.color.borderWidth = 0;
			this.color.borderRadius = 0;
			this.color.zIndex = 2000;
			*/

			/**
			 * On change function.
			 *
			 * @attribute onChange
			 * @type {Function}
			 */
			this.onChange = null;
		},

		/**
		 * Set onchange callback, called after changes.
		 *
		 * @method setOnChange
		 * @param {Function} onChange
		 */
		setOnChange : function(onChange) {
			this.on("change",this.onChange = onChange);
		},

		/**
		 * Set value stored in the input element.
		 *
		 * @method setValue
		 * @param {Number} r
		 * @param {Number} g
		 * @param {Number} b
		 */
		setValue : function(v) {
			//this.color.fromRGB(r * 255, g * 255, b * 255);
			this._value = Color.parse(v);
			this._velm.val(this._value.toHexString());
		},


		/**
		 * Get color value HEX as string.
		 *
		 * @method getValueString
		 * @return {String} String hex color.
		 */
		getValueString : function(color) {
			return this._value.toHexString();
		},

		/**
		 * Get color value object.
		 *
		 * @method getValue
		 * @return {Object} Color object.
		 */
		getValue : function() {
			return this._value;
		},

		/**
		 * Get color value HEX.
		 *
		 * @method getValueHex
		 * @return {Number} Numeric hex color.
		 */
		getValueHex : function() {
			//return this.color.get().toHex();
			return this._value.toNumber();
		}

	}); 


	return styles.ColorChooser = ColorChooser;
});
define('skylark-widgets-base/Widget',[
  "skylark-langx-ns",
  "skylark-langx-types",
  "skylark-langx-objects",
  "skylark-langx-events",
  "skylark-langx-numerics/vector2",
  "skylark-domx-browser",
  "skylark-domx-data",
  "skylark-domx-eventer",
  "skylark-domx-noder",
  "skylark-domx-files",
  "skylark-domx-geom",
  "skylark-domx-velm",
  "skylark-domx-query",
  "skylark-domx-fx",
  "skylark-domx-plugins-base",
  "skylark-data-collection/hash-map",
  "./base",
  "./skins/skin-manager"
],function(skylark,types,objects,events,Vector2,browser,datax,eventer,noder,files,geom,elmx,$,fx, plugins,HashMap,base,SkinManager){

     const NativeEvents = {
            "drag": 2, // DragEvent
            "dragend": 2, // DragEvent
            "dragenter": 2, // DragEvent
            "dragexit": 2, // DragEvent
            "dragleave": 2, // DragEvent
            "dragover": 2, // DragEvent
            "dragstart": 2, // DragEvent
            "drop": 2, // DragEvent

            "abort": 3, // Event
            "change": 3, // Event
            ///"error": 3, // Event
            "selectionchange": 3, // Event
            "submit": 3, // Event
            "reset": 3, // Event
            'fullscreenchange':3,
            'fullscreenerror':3,

/*
            'disablepictureinpicturechanged':3,
            'ended':3,
            'enterpictureinpicture':3,
            'durationchange':3,
            'leavepictureinpicture':3,
            'loadstart' : 3,
            'loadedmetadata':3,
            'pause' : 3,
            'play':3,
            'posterchange':3,
            'ratechange':3,
            'seeking' : 3,
            'sourceset':3,
            'suspend':3,
            'textdata':3,
            'texttrackchange':3,
            'timeupdate':3,
            'volumechange':3,
            'waiting' : 3,
*/


            "focus": 4, // FocusEvent
            "blur": 4, // FocusEvent
            "focusin": 4, // FocusEvent
            "focusout": 4, // FocusEvent

            "keydown": 5, // KeyboardEvent
            "keypress": 5, // KeyboardEvent
            "keyup": 5, // KeyboardEvent

            "message": 6, // MessageEvent

            "click": 7, // MouseEvent
            "contextmenu": 7, // MouseEvent
            "dblclick": 7, // MouseEvent
            "mousedown": 7, // MouseEvent
            "mouseup": 7, // MouseEvent
            "mousemove": 7, // MouseEvent
            "mouseover": 7, // MouseEvent
            "mouseout": 7, // MouseEvent
            "mouseenter": 7, // MouseEvent
            "mouseleave": 7, // MouseEvent


            "progress" : 11, //ProgressEvent

            "textInput": 12, // TextEvent

            "tap": 13,
            "touchstart": 13, // TouchEvent
            "touchmove": 13, // TouchEvent
            "touchend": 13, // TouchEvent

            "load": 14, // UIEvent
            "resize": 14, // UIEvent
            "select": 14, // UIEvent
            "scroll": 14, // UIEvent
            "unload": 14, // UIEvent,

            "wheel": 15, // WheelEvent

    };
 
  const Plugin = plugins.Plugin;

  var Widget = Plugin.inherit({
    klassName: "Widget",

    _construct : function(parent,elm,options) {
        if (parent && !(parent instanceof Widget || parent.element)) {
           options = elm;
           elm = parent;
           parent = null;
        }
        if (types.isHtmlNode(elm)) {
          options = this._parse(elm,options);
        } else {
          options = elm;
          elm = null;
        }
        if (types.isString(options)) {
          options = {
            tagName : options
          };
        }
        this.overrided(elm,options);

        if (!elm) {
          this._velm = this._create();
          this._elm = this._velm.elm();
        } else {
          this._velm = this.elmx(this._elm);
        }
        
        Object.defineProperty(this,"state",{
          value :this.options.state || new HashMap()
        });

        /** 
         * True if the element is visible.
         *
         * @attribute visible
         * @type {Boolean}
         */
        this.visible = true;
        

        //this.element.style.position = "absolute";
        //this.element.style.overflow = "hidden";

        /**
         * Size of this component in px.
         *
         * @attribute size
         * @type {Vector2}
         */
        this.size = new Vector2(0, 0);
        
        /**
         * Location of this component relatively to its parent in px.
         *
         * @attribute location
         * @type {Vector2}
         */
        this.location = new Vector2(0, 0);

        /**
         * Locationing mode, indicates how to anchor the component.
         *
         * @attribute mode
         * @type {Number}
         */
        this._mode = Widget.TOP_LEFT;
     
        //this.state = this.options.state || new Map();
        this._init();

        var addonCategoryOptions = this.options.addons;
        if (addonCategoryOptions) {
          var widgetCtor = this.constructor,
              addons = widgetCtor.addons;
          for (var categoryName in addonCategoryOptions) {
              for (var i =0;i < addonCategoryOptions[categoryName].length; i++ ) {
                var addonOption = addonCategoryOptions[categoryName][i];
                if (types.isString(addonOption)) {
                  var addonName = addonOption,
                      addonSetting = addons[categoryName][addonName],
                      addonCtor = addonSetting.ctor ? addonSetting.ctor : addonSetting;

                  this.addon(addonCtor,addonSetting.options);

                }

              }
          }
        }

        //if (this._elm.parentElement) {
        //  // The widget is already in document
        //  this._startup();
        //}

        if (parent) {
          this.setParent(parent);
        } else if (this._velm.isInDocument()) {
          this._startup();
        }

    },

    /**
     * Parses widget options from attached element.
     * This is a callback method called by constructor when attached element is specified.
     * @method _parse
     * @return {Object} options.
     */
    _parse : function(elm,options) {
      var optionsAttr = datax.data(elm,"options");
      if (optionsAttr) {
         //var options1 = JSON.parse("{" + optionsAttr + "}");
         var options1 = eval("({" + optionsAttr + "})");
         options = objects.mixin(options1,options); 
      }
      return options || {};
    },

    /**
     * Create html element for this widget.
     * This is a callback method called by constructor when attached element is not specified.
     * @method _create
     */
    _create : function() {
        var template = this.options.template;
        if (template) {
          return this.elmx(template);
        } else {
          var tagName = this.options.tagName;
          if (tagName) {
            return this.elmx(noder.createElement(tagName,{
              style : {
                position : "absolute",
                overflow : "hidden"
              }
            }))
          } else {
            throw new Error("The template or tagName is not existed in options!");
          }
        }
    },


    /**
     * Init widget.
     * This is a callback method called by constructor.
     * @method _init
     */
    _init : function() {
      var self = this;
      if (this.widgetClass) {
        this._velm.addClass(this.widgetClass);
      }
      this.state.on("changed",function(e,args) {
        self._refresh(args.data);
      });
    },


    /**
     * Startup widget.
     * This is a callback method called when widget element is added into dom.
     * @method _post
     */
    _startup : function() {

    },


    isNativeEvent : function(events) {
        if (types.isString(events)) {
            return !!NativeEvents[events];
        } else if (types.isArray(events)) {
            for (var i=0; i<events.length; i++) {
                if (NativeEvents[events[i]]) {
                    return true;
                }
            }
            return false;
        }            

    },   

    on : function(events, selector, data, callback, ctx, /*used internally*/ one) {
        if (this.el_ && this.isNativeEvent(events)) {
            eventer.on(this.el_,events,selector,data,callback,ctx,one);
        } else {
            Plugin.prototype.on.call(this,events, selector, data, callback, ctx,  one);
        }
    },   

    off : function(events, callback) {
        if (this.el_ && this.isNativeEvent(events)) {
            eventer.off(this.el_,events,callback);
        } else {
            Plugin.prototype.off.call(this,events,callback);
        }
    },

    listenTo : function(obj, event, callback, /*used internally*/ one) {
        if (types.isString(obj) || types.isArray(obj)) {
            one = callback;
            callback = event;
            event = obj;
            if (this.el_ && this.isNativeEvent(event)) {
                eventer.on(this.el_,event,callback,this,one);
            } else {
                this.on(event,callback,this,one);
            }
        } else {
            if (obj.nodeType) {
                eventer.on(obj,event,callback,this,one)
            } else {
                Plugin.prototype.listenTo.call(this,obj,event,callback,one)
            }                
        }
    },

    unlistenTo : function(obj, event, callback) {
        if (types.isString(obj) || types.isArray(obj)) {
            callback = event;
            event = obj;
            if (this.el_ && this.isNativeEvent(event)) {
                eventer.off(this.el_,event,callback);
            } else {
                this.off(event,callback);                   
            }
        } else {
            if (obj.nodeType) {
                eventer.off(obj,event,callback)
            } else {
                Plugin.prototype.unlistenTo.call(this,obj,event,callback)
            }
        }
    },

    /**
     * Update the location of this widget.
     * 
     * @method updateLocation
     */
    updateLocation : function(mode) {
      if(mode !== undefined) {
        this._mode = mode;
      }

      if(this._mode === Widget.TOP_LEFT || this._mode === Widget.TOP_RIGHT) {
        this._elm.style.top = this.location.y + "px";
      } else {
        this._elm.style.bottom = this.location.y + "px";
      }

      if(this._mode === Widget.TOP_LEFT || this._mode === Widget.BOTTOM_LEFT) {
        this._elm.style.left = this.location.x + "px";
      } else {
        this._elm.style.right = this.location.x + "px";
      }
    },

    /**
     * Update the size of this widget.
     * 
     * @method updateSize
     */
    updateSize : function(){
      this._elm.style.width = this.size.x + "px";
      this._elm.style.height = this.size.y + "px";
    },


    /**
     * Update visibility of this element.
     *
     * @method setVisibility
     */
    setVisibility : function(visible)   {
      this.visible = visible;
      this.updateVisibility();
    },


    /**
     * Update the visibility of this widget.
     *
     * @method updateVisibility
     */
    updateVisibility : function() {
      this._elm.style.display = this.visible ? "block" : "none";
    },


    /**
     * Refresh widget.
     * This is a callback method called when widget state is changed.
     * @method _refresh
     */
    _refresh : function(updates) {
      /*
      var _ = this._,
          model = _.model,
          dom = _.dom,
          props = {

          };
      updates = updates || {};
      for (var attrName in updates){
          var v = updates[attrName].value;
          if (v && v.toCss) {
              v.toCss(props);
              updates[attrName].processed = true;
          }

      };

      this.css(props);

      if (updates["disabled"]) {
          var v = updates["disabled"].value;
          dom.aria('disabled', v);
          self.classes.toggle('disabled', v);
      }
      */
    },                

    mapping : {
      "events" : {
  //       'mousedown .title':  'edit',
  //       'click .button':     'save',
  //       'click .open':       function(e) { ... }            
      },

      "attributs" : {

      },

      "properties" : {

      },

      "styles" : {

      }
    },

    addon : function(ctor,setting) {
      var categoryName = ctor.categoryName,
          addonName = ctor.addonName;

      this._addons = this.addons || {};
      var category = this._addons[categoryName] = this._addons[categoryName] || {};
      category[addonName] = new ctor(this,setting);
      return this;
    },

    addons : function(categoryName,settings) {
      this._addons = this.addons || {};
      var category = this._addons[categoryName] = this._addons[categoryName] || {};

      if (settings == undefined) {
        return objects.clone(category || null);
      } else {
        objects.mixin(category,settings);
      }
    },


    /**
     * Returns a html element representing the widget.
     *
     * @method render
     * @return {HtmlElement} HTML element representing the widget.
     */
    render: function() {
      return this._elm;
    },



    /**
     * Returns a parent widget  enclosing this widgets, or null if not exist.
     *
     * @method getEnclosing
     * @return {Widget} The enclosing parent widget, or null if not exist.
     */
    getEnclosing : function(selector) {
      return null;
    },

    /**
     * Returns a widget collection with all enclosed child widgets.
     *
     * @method getEnclosed
     * @return {List} Collection with all enclosed child widgets..
     */
    getEnclosed : function() {
      var self = this;
          children = new ArrayList();
      return children;
    },


    getSkin : function() {
      return SkinManager.get();
    },

    /**
     * Sets the visible state to true.
     *
     * @method show
     * @return {Widget} Current widget instance.
     */

    show : function() {
      this._velm.show();
    },

    /**
     * Sets the visible state to false.
     *
     * @method hide
     * @return {Widget} Current widget instance.
     */
    hide : function() {
      this._velm.hide();
    },

    /**
     * Focuses the current widget.
     *
     * @method focus
     * @return {Widget} Current widget instance.
     */
    focus :function() {
      try {
        this._velm.focus();
      } catch (ex) {
        // Ignore IE error
      }

      return this;
    },

    /**
     * Blurs the current widget.
     *
     * @method blur
     * @return {Widget} Current widget instance.
     */
    blur : function() {
      this._velm.blur();

      return this;
    },

    enable: function () {
      this.state.set('disabled',false);
      return this;
    },

    disable: function () {
      this.state.set('disabled',true);
      return this;
    },


    /** 
     * Add a CSS class to the base DOM element of this widget element.
     * 
     * @method addClass
     * @param {String} name Name of the class to be added.
     */
    addClass : function(name){
      this._velm.addClass(name);
      return this;
    },

    /** 
     * Determine whether this widget element is assigned the given class.
     * 
     * @method hasClass
     * @param {String} name Name of the class t.
     */
    hasClass : function(name){
      return this._velm.hasClass(name);
    },

    offset : function() {
        return this._velm.pagePosition();
    },

    outerWidth : function() {
        return this._velm.marginSize().width;
    },

    outerHeight : function() {
        return this._velm.marginSize().height;
    },

    /** 
     * Remove a CSS class from the base DOM element of this idget element.
     * 
     * @method removeClass
     * @param {String} name Name of the class to be removed.
     */
    removeClass: function(name) {
      this._velm.removeClass(name);
      return this;
    },

    /** 
     * Remove a CSS class from the base DOM element of this idget element.
     * 
     * @method removeClass
     * @param {String} name Name of the class to be removed.
     */
    toggleClass: function(name) {
      this._velm.toggleClass(name);
      return this;
    },

    /**
     * Sets the specified aria property.
     *
     * @method aria
     * @param {String} name Name of the aria property to set.
     * @param {String} value Value of the aria property.
     * @return {Widget} Current widget instance.
     */
    aria : function(name, value) {
      const self = this, elm = self.getEl(self.ariaTarget);

      if (typeof value === 'undefined') {
        return self._aria[name];
      }

      self._aria[name] = value;

      if (self.state.get('rendered')) {
        elm.setAttribute(name === 'role' ? name : 'aria-' + name, value);
      }

      return self;
    },

    attr: function (name,value) {
        var velm = this._velm,
            ret = velm.attr(name,value);
        return ret == velm ? this : ret;
    },

    getAttr : function(name) {
      return this._velm.attr(name);
    },

    setAttr : function(name,value) {
      this._velm.attr(name,value);
      return this;
    },

    removeAttr : function(name) {
      this._velm.removeAttr(name);
      return this;
    },


    /**
     * Calculate the location of the container to make it centered.
     *
     * Calculated relatively to its parent size.
     * 
     * @method center
     */
    center : function() {
      this.location.set((this.parent.size.x - this.size.x) / 2, (this.parent.size.y - this.size.y) / 2);
    },

    css: function (name, value) {
        var velm = this._velm,
            ret = velm.css(name, value);
        return ret == velm ? this : ret;
    },

    getStyle : function(name) {
      return this._velm.css(name);
    },

    setStyle : function(name,value) {
      this._velm.css(name,value);
      return this;
    },

    data: function (name, value) {
        var velm = this._velm,
            ret = velm.data(name,value);
        return ret == velm ? this : ret;
    },


    getData : function(name) {
      return this._velm.data(name);
    },

    setData : function(name,value) {
      this._velm.data(name,value);
      return this;
    },


    parent : {
      get : function() {
        return this.getParent();
      },
      set : function(v) {
        this.setParent(v);
      }
    },

    getParent : function() {
      return this._parent;
    },

    setParent : function(parent) {
      var oldParent = this._parent;
      this._parent = parent;
      if (parent) {
        this.mount(parent._elm || parent.element);
        if (parent._setupChild) {
          parent._setupChild(this);
        }
      } else if (oldParent) {
        this.unmount();
      }
      return this;
    },


    prop: function (name,value) {
        var velm = this._velm,
            ret = velm.prop(name,value);
        return ret == velm ? this : ret;
    },

    getProp : function(name) {
      return this._velm.prop(name);
    },

    setProp : function(name,value) {
      this._velm.prop(name,value);
      return this;
    },

    throb: function(params) {
      if (this.options.throbber) {
        params = objects.defaults(params,this.options.throbber);
      }
      return noder.throb(this._elm,params);
    },

    /*
    emit : function(type,params) {
      var e = events.createEvent(type,{
        data : params
      });
      return events.Emitter.prototype.emit.call(this,e,params);
    },
    */

    /**
     * Update component appearance.
     * 
     * Should be called after changing size or location.
     *
     * Uses the updateVisibility and if the element is visible calls the updateSize and updateLocation (in this order) methods to update the interface.
     * 
     * @method update
     */
    update : function() {
      this.updateVisibility();

      if(this.visible) {
        this.updateSize();
        this.updateLocation();
      }
    },


    /**
     *  mount the current widget element to dom document.
     *
     * @method mount
     * @return {Widget} This Widget.
     */
    mount : function(target,position){
        var toElm = target.element || target,
            elm = this._elm;
        if (!position || position=="child") {
            noder.append(toElm,elm);
        } else  if (position == "before") {
            noder.before(toElm,elm);
        } else if (position == "after") {
            noder.after(toElm,elm);
        } else if (position == "prepend") {
            noder.prepend(toElm,elm);         
        }
        this._startup();
    },

    /**
     *  unmount the current widget element from dom document.
     *
     * @method html
     * @return {HtmlElement} HTML element representing the widget.
     */
    unmount : function() {
      this._velm.remove();
    },

    preventDragEvents : function() {
      this.element.ondrop = Widget.preventDefault;
      this.element.ondragover = Widget.preventDefault;
    },


    element : {
      get : function() {
        return this._elm;
      },

      set : function(v) {
        this._elm = v;
      }
    },

    position : {
      get : function() {
        return this.location;
      },

      set : function(v) {
        this.location = v;
      }
    },

    /**
     * Set alt text, that is displayed when the mouse is over the element. Returns the element created that is attached to the document body.
     *
     * @method setAltText
     * @param {String} altText Alt text.
     */
    setAltText : function(altText)   {
      var element = document.createElement("div");
      element.style.position = "absolute";
      element.style.display = "none";
      element.style.alignItems = "center";
      element.style.zIndex = "10000";
      element.style.border = "3px solid";
      element.style.borderRadius = "5px";
      element.style.color = Editor.theme.textColor;
      element.style.backgroundColor = Editor.theme.barColor;
      element.style.borderColor = Editor.theme.barColor;
      element.style.height = "fit-content";
      document.body.appendChild(element);

      //Text
      var text = document.createTextNode(altText);
      element.appendChild(text);

      //Destroy
      var destroyFunction = this.destroy;
      this.destroy = function()
      { 
        destroyFunction.call(this);

        if(document.body.contains(element))
        {
          document.body.removeChild(element);
        }
      };
      
      this._elm.style.pointerEvents = "auto"; 

      //Mouse mouse move event
      this._elm.onmousemove = function(event) {
        element.style.display = "flex";
        element.style.left = (event.clientX + 8) + "px";
        element.style.top = (event.clientY - 20) + "px";
      };

      //Mouse out event
      this._elm.onmouseout = function()  {
        element.style.display = "none";
      };

      return element;
    },

    /**
     * Set method to be called on component click.
     * 
     * @method setOnClick
     * @param {Function} callback Function called when the component is clicked.
     */
    setOnClick : function(callback)  {
      this._elm.onclick = callback;
    },

    /**
     * Remove all DOM children from the element.
     * 
     * @method removeAllChildren
     */
    removeAllChildren : function()   {
      while(this._elm.firstChild) {
        this._elm.removeChild(this._elm.firstChild);
      }
    },

    /**
     * Set positioning mode.
     * 
     * @method setMode
     * @param {Number} setMode
     */
    setMode : function(mode) {
      this._mode = mode;
      this._elm.style.bottom = null;
      this._elm.style.right = null;
      this._elm.style.left = null;
    },


    /**
     * Called to destroy a component.
     *
     * Destroy the element and removes it from its DOM parent.
     * 
     * @method destroy
     */
    destroy : function()
    {
      if(this._parent)
      {
        if(this._parent.element)
        {
          if(this._parent.element.contains(this.element))
          {
            this._parent.element.removeChild(this.element);
            this._parent = null;
          }
        }
        else
        {
          console.warn("nunuStudio: Parent is not a Element.", this);
          if(this._parent.contains(this.element))
          {
            this._parent.removeChild(this.element);
            this._parent = null;
          }
        }
      }
    }

  });

  Widget.prototype.updateInterface = Widget.prototype.update;
  Widget.prototype.updatePosition = Widget.prototype.updateLocation;
  Widget.prototype.attachTo = Widget.prototype.setParent;
  Widget.prototype._attachTo = Widget.prototype.mount;
  Widget.prototype.detach = Widget.prototype.unmount;

  /**
   * Top-left locationing.
   *
   * @static
   * @attribute TOP_LEFT
   * @type {Number}
   */
  Widget.TOP_LEFT = 0;

  /**
   * Top-right locationing.
   *
   * @static
   * @attribute TOP_RIGHT
   * @type {Number}
   */
  Widget.TOP_RIGHT = 1;

  /**
   * Bottom-left locationing.
   *
   * @static
   * @attribute BOTTOM_LEFT
   * @type {Number}
   */
  Widget.BOTTOM_LEFT = 2;

  /**
   * Bottom-right locationing.
   *
   * @static
   * @attribute BOTTOM_RIGHT
   * @type {Number}
   */
  Widget.BOTTOM_RIGHT = 3;

  Widget.inherit = function(meta) {
    var ctor = plugins.Plugin.inherit.apply(this,arguments);

    function addStatePropMethod(name) {
        ctor.prototype[name] = function(value) {
          if (value !== undefined) {
            this.state.set(name,value);
            return this;
          } else {
            return this.state.get(name);
          }
        };
    }
    if (meta.state) {
      for (var name in meta.state) {
          addStatePropMethod(name);
      }
    }

    if (meta.pluginName) {
      plugins.register(ctor,meta.pluginName);
    }
    return ctor;
  };

  Widget.register = function(ctor,widgetName) {
    var meta = ctor.prototype,
        pluginName = widgetName || meta.pluginName;

    function addStatePropMethod(name) {
        ctor.prototype[name] = function(value) {
          if (value !== undefined) {
            this.state.set(name,value);
            return this;
          } else {
            return this.state.get(name);
          }
        };
    }
    if (meta.state) {
      for (var name in meta.state) {
          addStatePropMethod(name);
      }
    }

    if (pluginName) {
      plugins.register(ctor,pluginName);
    }
    return ctor;
  };

  Widget.preventDefault = function(event)
  {
    event.preventDefault();
  };

  return base.Widget = Widget;
});

define('skylark-widgets-styles/color-gradient-chooser',[
	"skylark-graphics-colors/Color",
	"skylark-domx-plugins-colors/colorer",	
	"skylark-widgets-base/Widget",
	"./styles"
],function(
	Color,
	colorer,
	Widget,
	styles
){
	"use strict";

	/**
	 * Color gradient chooser is used to select and preview a gradient of colors store in an array.
	 *
	 * @class ColorGradientChooser
	 * @extends {Widget}
	 * @param {Widget} parent Parent element.
	 */
	var ColorGradientChooser = Widget.inherit({
		"klassName" : "ColorGradientChooser",

		"_construct" : function (parent){
			Widget.prototype._construct.call(this, parent, "div");

			/**
			 * On change callback function.
			 *
			 * @property onChange
			 * @type {Function}
			 */
			this.onChange = null;

			/**
			 * Color values of the gradient.
			 *
			 * @property values
			 * @type {Array}
			 */
			this.values = [];

			/**
			 * Buttons DOM element. Buttons have a onchange, color and index properties attached to them.
			 *
			 * @property buttons
			 * @type {Array}
			 */
			this.buttons = [];

			this._elm.style.overflow = "hidden";
			this._elm.style.backgroundColor = Editor.theme.panelColor;
			this._elm.style.borderStyle = "none";
			this._elm.style.boxSizing = "border-box";
			this._elm.style.borderRadius = "4px";
			this._elm.style.zIndex = "2000";

			/**
			 * Canvas DOM element used to draw the gradient.
			 *
			 * @property canvas
			 * @type {DOM}
			 */
			this.canvas = document.createElement("canvas");
			this.canvas.style.position = "absolute";
			this.canvas.style.top = "0px";
			this.canvas.style.left = "0px";
			this.canvas.style.width = "100%";
			this.canvas.style.height = "100%";
			this._elm.appendChild(this.canvas);
		},


		/**
		 * Update the buttos to match new values.
		 *
		 * @method updateButtons
		 */
		updateButtons : function()	{
			var self = this;

			function buttonOnChange()
			{
				var rgb = this.color.rgb;

				self.values[this.index].setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
				self.updateValues();

				if(self.onChange !== null)
				{
					self.onChange(self.values[this.index], this.index);
				}
			}

			while(this.buttons.length > this.values.length)
			{
				this._elm.removeChild(this.buttons.shift());
			}

			while(this.buttons.length < this.values.length)
			{
				var button = document.createElement("input");
				button.type = "text";
				button.style.display = "block";
				button.style.position = "absolute";
				button.style.top = "0px";
				button.style.width = "15px";
				button.style.height = "100%";
				button.style.cursor = "pointer";
				button.style.outline = "none";
				button.style.borderStyle = "none";
				button.style.boxSizing = "border-box";
				button.style.borderRadius = "2px";
				this._elm.appendChild(button);

				var color = colorer(button);
				/*
				var color = new jscolor(button);
				color.backgroundColor = Editor.theme.boxColor;
				color.insetColor = Editor.theme.boxColor;
				color.shadow = false;
				color.borderWidth = 0;
				color.borderRadius = 0;
				color.zIndex = 2000;
				*/

				button.onchange = buttonOnChange;
				button.color = color;
				button.index = -1;

				this.buttons.push(button);
			}

			for(var i = 0; i < this.buttons.length; i++)
			{
				this.buttons[i].index = i;
			}
		},

		/**
		 * Update the representation of the gradient.
		 *
		 * @method updateValues
		 */
		updateValues : function(){
			var context = this.canvas.getContext("2d");
			var gradient = context.createLinearGradient(0, 0, this.canvas.width, 0);

			var colorStep = 1 / (this.values.length - 1);
			var colorPercentage = 0;

			var buttonSpacing = (this.size.x - 15) / (this.buttons.length - 1);
			var buttonPosition = 0;

			for(var i = 0; i < this.values.length; i++)
			{
				gradient.addColorStop(colorPercentage, this.values[i].getStyle());

				//this.buttons[i].color.fromRGB(this.values[i].r * 255, this.values[i].g * 255, this.values[i].b * 255);
				this.buttons[i].color.set({
					r : this.values[i].r * 255, 
					g : this.values[i].g * 255, 
					b : this.values[i].b * 255
				});
				this.buttons[i].style.left = buttonPosition + "px";

				colorPercentage += colorStep;
				buttonPosition += buttonSpacing;
			}

			context.fillStyle = gradient;
			context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		},

		/**
		 * Set onChange callback that receives (value, index) as arguments.
		 *
		 * @method setOnChange
		 * @param {Function} onChange OnChange callback receives value and index as arguments.
		 */
		setOnChange : function(onChange)	{
			this.onChange = onChange;
		},

		/**
		 * Set an array of color values to be displayed on this gradient.
		 *
		 * @method setValue
		 * @param {Array} values
		 */
		setValue : function(values)	{
			this.values = [];

			for(var i = 0; i < values.length; i++)
			{
				var color = new Color();
				color.copy(values[i]);
				this.values.push(color);
			}

			this.updateButtons();
			this.updateValues();
		},

		/**
		 * Get the values stored in this element.
		 *
		 * @method getValue
		 * @return {Array} Values of the gradient.
		 */
		getValue : function()	{
			return this.values;
		},

		updateSize : function()	{
			Widget.prototype.updateSize.call(this);
			
			this.canvas.width = this.size.x;
			this.canvas.height = this.size.y;

			this.updateValues();
		}

	});


	return styles.ColorGradientChooser = ColorGradientChooser;
});

define('skylark-widgets-styles/main',[
	"./styles",
	"./color-chooser",
	"./color-gradient-chooser"
],function(styles){
	return styles;
});
define('skylark-widgets-styles', ['skylark-widgets-styles/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-widgets-styles.js.map
