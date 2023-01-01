import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    let self = this;
    let active = { curr: null };
    let listeners = new Map();
    let map = new Map();

    this.activate = function( name )
    {
        let link = self.getLink( name );
            link?.click();
    };  
    
    this.highlight = function( name )
    {
        let link = self.getLink( name );

        if ( link )
            this.setActive( link );
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

    this.getLink = function( name )
    {
        this.activated = name;
        
        return self.element.querySelector( `[ data-link = "${ name?.toLowerCase() }" ]` );
    };

    this.init = async function( params )
    {
        this.element = t2.common.el( "div", this.parent.element );
        this.element.id = params.id;
        this.element.style.display = params.format;

        Object.assign( this, params );

        Handlers.call( this );
    };

    this.setActive = function( link )
    {
        if ( !link )
            return;
        
        link.classList.add( "active" );

        let name = link.getAttribute( "data-link" );

        this.activated = name
        this.setBreadcrumbs( name ); 

        if ( active.curr && active.curr !== link )
        {
            active.curr.classList.remove( "active" );   
            active.curr.classList.remove( "inactive" );    
        }

        active.curr = link;  
    };

    this.setModule = function( module )
    {
        this.module = module;
    };

    this.update = function( array )
    {
        this.array = array;
        this.element.innerHTML = null;
        
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
                        listener.handler( e, listener, active );
                } );

            map.set( element, new Map() );        
        } ); 
    };
};

export default Component;