import Handlers from "./t2.container.handlers.js";

const Container = function()
{
    let exits = [];
    
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
                this.exit();
                this.remove();
            }
        } );

        Object.assign( this, params );

        Handlers.call( this );
    };

    this.exit = () => exits.forEach( exit => exit() );

    this.setExit = ( f ) => exits.push( f );

    this.reset = function()
    {
        this.clear();
        this.show();
    };
};

export default Container;