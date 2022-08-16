const Menu = function()
{
    let self = this;
    let active = { curr: null };
    let listeners = new Map();
    let map = new Map();

    this.activate = function( name )
    {
        let link = self.element.querySelector( `[ data-link = "${ name.toLowerCase() }" ]` );

        self.setActive( link );
    };   
    
    this.addListener = function( listener )
    {
        listeners.set( listener, null );
        listen();
    };

    this.disable = function( array )
    {
        array.forEach( name =>
        {
            let link = self.element.querySelector( `[ data-link = "${ name }" ]` );
                link.classList.add( "disabled" );
        } );
    };

    this.init = function( params )
    {
        this.element = t2.common.el( "div", params.parent );
        this.element.id = params.id;
        this.element.style.display = params.horizontal ? "flex" : "block";
        this.breadcrumb = params.breadcrumb || 0;

        this.update( params.array );
    };

    this.setActive = function( link )
    {
        if ( !link )
            return;
        
        link.classList.add( "active" );

        t2.ui.breadcrumbs.splice( this.breadcrumb );
        t2.ui.breadcrumbs[ this.breadcrumb ] = link.textContent;

        if ( active.curr && active.curr !== link )
        {
            active.curr.classList.remove( "active" );      
        }

        active.curr = link;  
    };

    this.setBreadcrumbs = function( component )
    {
        this.breadcrumbs = component;
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
            
            map.set( element, new Map() );
        } );

        listen();
    };
    
    function listen()
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

        let link = arguments[ 0 ].target;
            
        self.activate( link.textContent.toLowerCase() );

        listener.handler( ...arguments );
    } 
};

export default Menu;