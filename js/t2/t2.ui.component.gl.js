import Handlers from "./t2.component.handlers.js";
import Context from "./t2.component.gl.context.js";

const Component = function()
{
    this.init = function( params )
    {
        let w = this.parent.element.clientWidth;
        let h = this.parent.element.clientHeight;

        this.element = t2.common.el( "canvas", this.parent.element );
        this.element.id = params.id;
        this.element.setAttribute( "width", w );
        this.element.setAttribute( "height", h );
        this.element.style.padding = 0;

        Object.assign( this, params );

        Handlers.call( this );

        Context.call( this );
    };
};

export default Component;