import Handlers from "./t2.container.handlers.js";

const Container = function()
{
    this.init = function( params )
    {
        this.element = t2.common.el( "div", this.parent.element );
        this.element.classList.add( "popup" );
        this.element.classList.add( "hidden" );
        this.element.setAttribute( "id", "popup" );
        this.element.setAttribute( "date-ignore", "clear" );
        this.element.addEventListener( "click", ( e ) => 
        {
            e.stopPropagation();

            if ( e.target == this.element )
            {
                this.clear();
                this.hide();
            }
        } );

        Object.assign( this, params );

        Handlers.call( this );
    }
};

export default Container;