import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    let self = this;

    this.init = function( params )
    {
        this.element = t2.common.el( "div", this.parent.element );
        this.element.classList.add( "path" );
        this.element.setAttribute( "data-ignore", "clear" );

        Object.assign( this, params );

        Handlers.call( this );
    }; 
};

export default Component;