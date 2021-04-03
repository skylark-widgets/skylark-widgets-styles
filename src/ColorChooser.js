define([
	"skylark-langx/langx",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-plugins-popups",
	"skylark-graphics-colors/Color",
	"skylark-domx-plugins-colors/ColorPane",
	"skylark-widgets-base/Widget",
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