import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    let self = this;
    let active = { curr: null };
    let listeners = new Map();
    let map = new Map();

    this.activate = function( name )
    {
        let link = self.element.querySelector( `[ data-link = "${ name }" ]` );
            link?.click();
    };   
    
    this.addListener = function( listener )
    {
        listeners.set( listener.type, listener );
    };

    this.disable = function( array )
    {
        array.forEach( name =>
        {
            let link = self.element.querySelector( `[ data-link = "${ name }" ]` );
                link?.classList.add( "disabled" );
        } );
    };

    this.init = async function( params )
    {
        this.element = t2.common.el( "div", this.parent.element );
        this.element.id = params.id;
        this.element.style.display = params.format;

        this.update( params.array );
        this.listen();

        Object.assign( this, params );

        Handlers.call( this );
    };

    this.setActive = function( link )
    {
        if ( !link )
            return;
        
        link.classList.add( "active" );

        if ( active.curr && active.curr !== link )
        {
            active.curr.classList.remove( "active" );   
            active.curr.classList.remove( "inactive" );    
        }

        active.curr = link;  
    };

    this.update = function( array )
    {
        self.element.innerHTML = null;
        
        array.forEach( link =>
        {
            let element = t2.common.el( "div", self.element );
                element.classList.add( "link" );
                element.textContent = link;
                element.dataset.link = link.toLowerCase();
                element.addEventListener( "click", ( e ) => 
                {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    this.setActive( element );

                    for ( let [ type, listener ] of listeners )
                    {
                        f( e, listener, active );
                    };
                } );

            map.set( element, new Map() );        
        } ); 
    };
    
    this.listen = function()
    {
        Array.from( map.keys() ).forEach( element =>
        {
            Array.from( listeners.keys() ).forEach( listener =>
            {
                element.removeEventListener( listener.type, ( e ) => f( e, listener, active ) );
                element.addEventListener( listener.type, ( e ) => f( e, listener, active ) );
            } );
        } );
    };

    function f( e, listener )
    {
        e.preventDefault();
        e.stopPropagation();

        listener.handler( ...arguments );
    } 
};

export default Component;