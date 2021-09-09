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
	"skylark-graphics-colors/color",
	"skylark-domx-plugins-colors/color-pane",
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
define('skylark-widgets-styles/color-gradient-chooser',[
	"skylark-graphics-colors/color",
	"skylark-domx-plugins-colors/colorer",	
	"skylark-widgets-base/widget",
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
