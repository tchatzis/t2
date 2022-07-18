const Menu = function()
{
    let self = this;
    let active = { curr: null };
    let listeners = new Map();
    let map = new Map();
    
    this.addListener = function( listener )
    {
        listeners.set( listener, null );
        listen();
    };

    this.init = function( params )
    {
        this.element = t2.common.el( "div", params.parent );
        this.element.id = params.id;
        this.element.style.display = params.horizontal ? "flex" : "block";

        params.array.forEach( link =>
        {
            let element = t2.common.el( "div", this.element );
                element.classList.add( "link" );
                element.textContent = link;
                element.dataset.link = link;
            
            map.set( element, new Map() );
        } );
    };

    this.activate = function( name )
    {
        let link = self.element.querySelector( `[ data-link = "${ name }" ]` );

        self.setActive( link );
    };

    this.setActive = function( link )
    {
        link.classList.add( "active" );

        if ( active.curr && active.curr !== link )
        {
            active.curr.classList.remove( "active" );   
        }

        active.curr = link;  
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
            
        self.setActive( link );

        listener.handler( ...arguments );
    } 
};

export default Menu;