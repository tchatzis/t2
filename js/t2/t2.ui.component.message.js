import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    this.init = function( params )
    {
        this.element = t2.common.el( "div", this.parent.element );
        this.element.classList.add( "message" );

        const remove = () => this.element.remove();

        setTimeout( remove, 5000 );

        Object.assign( this, params );

        Handlers.call( this );
    };
};

export default Component;