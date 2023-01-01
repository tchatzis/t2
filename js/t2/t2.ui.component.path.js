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

    this.reset = function()
    {
        this.array = [];
    };

    this.unset = function( index )
    {
        this.array.splice( index, 1 );
        this.element.textContent = this.array.join( "/" );
    };
};

export default Component;