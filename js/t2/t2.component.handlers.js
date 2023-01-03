import Common from "./t2.common.handlers.js";

const Handlers = function()
{
    let self = this;
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

    this.dispatch = function( type )
    {
        let event = new Event( type );

        this.element.dispatchEvent( event );
    }

    this.subscription =
    {
        add: ( params ) => 
        {
            let f = this[ params.event ];
            
            if ( !f || !f instanceof Function )
                return;

            let after = () => this.dispatch( params.event );

            this[ params.event ] = f.extend( null, after );

            this.element.addEventListener( params.event, params.handler );
        },
        remove: ( params ) => this.element.removeEventListener( params.event, params.handler )
    };

    Common.call( this );
};

export default Handlers;