import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    let self = this;
    let path = [];
    
    this.init = function( params )
    {
        this.element = t2.common.el( "div", this.parent.element );
        this.element.classList.add( "path" );
        this.element.setAttribute( "data-ignore", "clear" );

        Object.assign( this, params );

        Handlers.call( this );

        this.set.path = function( index, value )
        {
            path[ index ] = value;
            self.element.textContent = path.join( "/" );
        };
    }; 
};

export default Component;