import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    this.init = function( params )
    {
        this.element = t2.common.el( "div", this.parent.element );

        Object.assign( this, params );

        Handlers.call( this );
    };
};

export default Component;