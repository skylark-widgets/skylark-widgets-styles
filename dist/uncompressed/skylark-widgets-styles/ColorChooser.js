define([
	"skylark-domx-colors/colorer",
	"skylark-widgets-base/Widget",
	"./styles"
],function(
	colorer,
	Widget,
	styles
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
			 this.color = colorer(this._elm);
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
			this._elm.onchange = onChange;
		},

		/**
		 * Set value stored in the input element.
		 *
		 * @method setValue
		 * @param {Number} r
		 * @param {Number} g
		 * @param {Number} b
		 */
		setValue : function(r, g, b) {
			//this.color.fromRGB(r * 255, g * 255, b * 255);
			this.color.set({
				r:r * 255,
				g:g * 255,
				b:b * 255
			});
		},

		/**
		 * Set value from numeric hex.
		 *
		 * @method setValueHex
		 * @param {Number} hex
		 */
		setValueHex : function(hex) {
			hex = Math.floor(hex);
			//this.color.fromRGB(hex >> 16 & 255, hex >> 8 & 255, hex & 255);
			this.color.set({
				r:hex >> 16 & 255,
				g:hex >> 8 & 255,
				b:hex & 255
			})
		},

		/**
		 * Set value from CSS string.
		 *
		 * @method setValueString
		 * @param {Number} color
		 */
		setValueString : function(color) {
			//this.color.fromString(color);
			this.color.set(color);
		},

		/**
		 * Get color value HEX as string.
		 *
		 * @method getValueString
		 * @return {String} String hex color.
		 */
		getValueString : function(color) {
			return this.color.toHEXString();
		},

		/**
		 * Get color value object.
		 *
		 * @method getValue
		 * @return {Object} Color object.
		 */
		getValue : function() {
			return {r: this.color.rgb[0] / 255, g: this.color.rgb[1] / 255, b: this.color.rgb[2] / 255};
		},

		/**
		 * Get color value HEX.
		 *
		 * @method getValueHex
		 * @return {Number} Numeric hex color.
		 */
		getValueHex : function() {
			return (this.color.rgb[0] << 16 ^ this.color.rgb[1] << 8 ^ this.color.rgb[2] << 0);
		}

	}); 


	return styles.ColorChooser = ColorChooser;
});