const Common = function()
{
    let self = this;

    this.addTime = ( _date, time ) =>
    {
        let date = new Date( _date );
        
        let components = time.split( ":" );
            components = components.map( c => Number( c ) );

        let hour = components[ 0 ];
            hour = String( hour ).padStart( 2, "0" );
        date.setHours( hour );

        let minute = components[ 1 ];
            minute = String( minute ).padStart( 2, "0" );
        date.setMinutes( minute );

        let second = components[ 2 ];
            second = String( second ).padStart( 2, "0" );    
        date.setSeconds( second );

        return date;
    };
    
    this.clear = ( ids ) => 
    {
        ids.forEach( id => 
        {              
            let el = t2.ui.elements.get( id );
            if ( el )
            {
                let children = Array.from( el.children );
                    children.forEach( child =>
                    {   
                        let predicate = this.ignored( "clear", child );

                        if ( !predicate )
                            el.removeChild( child );
                    } );
            }
        } );
    };

    this.el = ( tag, parent ) => 
    { 
        let el = document.createElement( tag ); 
        parent.appendChild( el );
        
        return el; 
    };
    
    this.getParent = function( elParams )
    {
        elParams.parent = ( typeof elParams.parent == "object" ) ? elParams.parent : document.getElementById( elParams.parent );

        return elParams.parent;
    };
    
    this.ignored = function( f, child )
    {
        let ignore = child.dataset.ignore ? child.dataset.ignore.split( "," ) : [];
        
        return ignore.find( dataset => f == dataset );
    };

    this.remove = ( ids ) => 
    {
        ids.forEach( id => 
        {              
            let el = t2.ui.elements.get( id );
                el.remove();
        } );
    };
    
    this.sort = ( array, key ) => array.sort( ( a, b ) => ( key ? a[ key ] > b[ key ] : a > b ) ? 1 : -1 );

    this.svg = function( tag )
    {
        return document.createElementNS( "http://www.w3.org/2000/svg", tag );
    };
};

export default Common;