const Menu = function()
{
    let self = this;
    let active = { link: null };
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

        params.array.sort().forEach( link =>
        {
            let element = t2.common.el( "div", this.element );
                element.classList.add( "link" );
                element.textContent = link;
            
            map.set( element, new Map() );
        } );
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

    function f( e, listener, active )
    {
        e.preventDefault();
        e.stopPropagation();

        listener.handler( ...arguments );
    } 
};

export default Menu;