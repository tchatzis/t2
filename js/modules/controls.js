const Controls = function()
{
    let el = t2.common.el;

    const map = new Map();

    this.init = function( params )
    {   
        map.set( params.name, map.get( params.name ) || [] );
        
        return new this[ params.type ]( params );
    };
    
    this.Checkbox = function( params )
    {
        let handlers = [];

        this.init = function()
        {
            let cell = el( "div", params.parent );
                cell.style.pointerEvents = "none";

            let checkbox = el( "input", cell );
                checkbox.type = "checkbox";
                checkbox.name = params.name;
                checkbox.addEventListener( "click", ( e ) => 
                { 
                    e.stopPropagation();
                    
                    toggle( params );
                    check( params );
                } );
            
            handle.call( checkbox, params );
            
            this.element = checkbox;

            return this;
        };  
        
        this.listener = function( event )
        {
            handlers.push( event );
        };
        
        this.map = map;
        
        this.name = params.name;
        
        // handlers
        function check( params )
        {
            let array = map.get( params.name );
            let index = array.findIndex( item => params.item.id == item.id );

            // add item if not in array already
            if ( index == -1 )
                array.push( params.item );
            // if item is found in array and the checkbox is not checked then remove from array
            else if ( ( index > -1 ) && !params.parent.classList.contains( "checked" ) )
                array.splice( index, 1 );

            map.set( params.name, array );
        }
        
        function handle( params )
        {
            handlers.forEach( event =>
            {
                this.addEventListener( event.type, ( e ) => event.handler( params ) );
            } );
        }
        
        function toggle( params )
        {
            params.parent.classList.toggle( "checked" );
        }
    };
};

export default Controls;