import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    this.init = function( params )
    {
        let parent = this.parent.element;

        this.width = parent.clientWidth;
        this.height = parent.clientHeight;
        
        this.element = t2.common.el( "canvas", parent );
        this.element.id = params.id;
        this.element.setAttribute( "width", this.width );
        this.element.setAttribute( "height", this.height );
        
        this.ctx = this.element.getContext( "2d" );  

        Object.assign( this, params );

        Handlers.call( this );
    };

    this.clear = function()
    {
        this.ctx.clearRect( 0, 0, this.width, this.height );
    };
};

export default Component;