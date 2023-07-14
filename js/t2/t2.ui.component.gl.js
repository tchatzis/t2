import Handlers from "./t2.component.handlers.js";
import Context from "./t2.component.gl.context.js";

const Component = function()
{
    let _params = {};
    let div;
    
    this.init = function( params )
    {
        let w = this.parent.element.clientWidth - 2;
        let h = this.parent.element.clientHeight * 0.9;

        this.element = div || t2.common.el( "div", this.parent.element );
        this.element.width  = this.parent.element.clientWidth + "px";
        this.element.height = this.parent.element.clientHeight + "px";

        let canvas = t2.common.el( "canvas", this.element );
            canvas.id = params.id;
            canvas.setAttribute( "width", w );
            canvas.setAttribute( "height", h );
            canvas.style.padding = 0;

        this.canvas = canvas;

        Object.assign( this, params );

        _params = params;
        div = this.element;

        Handlers.call( this );

        Context.call( this );
    };

    this.restore = () => 
    {
        this.element.innerHTML = null;
        this.init( _params ); 
    };
};

export default Component;