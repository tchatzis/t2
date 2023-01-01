import Common from "./t2.common.handlers.js";

const Handlers = function()
{
    let breadcrumbs;
    let index;
    
    this.element.setAttribute( "data-format", this.format || "" );

    this.addBreadcrumbs = function( _index, component )
    {
        index = _index;
        breadcrumbs = component;
    };

    this.setBreadcrumbs = function( value )
    {
        if ( breadcrumbs )
            breadcrumbs.set( index, value );
    };

    Common.call( this );
};

export default Handlers;