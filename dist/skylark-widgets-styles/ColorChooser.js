/**
 * skylark-widgets-styles - The skylark style widgets library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-styles/
 * @license MIT
 */
define(["skylark-domx-colors/colorer","skylark-widgets-base/Widget","./styles"],function(t,e,o){"use strict";var r=e.inherit({klassName:"ColorChooser",_construct:function(o){e.prototype._construct.call(this,o,"input"),this._elm.type="text",this._elm.style.outline="none",this._elm.style.borderStyle="none",this._elm.style.boxSizing="border-box",this._elm.style.textIndent="4px",this._elm.style.borderRadius="4px",this._elm.style.boxShadow="none",this._elm.style.MozAppearance="textfield",this._elm.style.webkitAppearance="caret",this._elm.style.appearance="textfield",this.color=t(this._elm),this.onChange=null},setOnChange:function(t){this._elm.onchange=t},setValue:function(t,e,o){this.color.set({r:255*t,g:255*e,b:255*o})},setValueHex:function(t){t=Math.floor(t),this.color.set({r:t>>16&255,g:t>>8&255,b:255&t})},setValueString:function(t){this.color.set(t)},getValueString:function(t){return this.color.toHEXString()},getValue:function(){return{r:this.color.rgb[0]/255,g:this.color.rgb[1]/255,b:this.color.rgb[2]/255}},getValueHex:function(){return this.color.rgb[0]<<16^this.color.rgb[1]<<8^this.color.rgb[2]<<0}});return o.ColorChooser=r});
//# sourceMappingURL=sourcemaps/ColorChooser.js.map
