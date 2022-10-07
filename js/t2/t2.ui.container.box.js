import Handlers from "./t2.container.handlers.js";

const Container = function()
{
    this.init = function( params )
    {
        this.element = t2.common.el( "div", this.parent.element );
        this.element.classList.add( "container" );

        Object.assign( this, params );

        Handlers.call( this );
    };
};

export default Container;