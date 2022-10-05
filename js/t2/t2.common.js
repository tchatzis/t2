const Common = function()
{
    let self = this;

    this.addTime = ( _date, time ) =>
    {
        let date = new Date( _date );
        
        let components = time.split( ":" );
            components = components.map( c => Number( c ) );

        let hour = components[ 0 ];
        date.setHours( hour );

        let minute = components[ 1 ];
        date.setMinutes( minute );

        let second = components[ 2 ];  
        date.setSeconds( second );

        return date;
    };
    
    this.clear = ( ids ) => 
    {
        ids.forEach( id => 
        {              
            let el = t2.ui.children.get( id ).element;
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

    this.dates = function( array )
    {
        let dates = array.map( date => new Date( date ) ); 
            dates.sort( ( a, b ) => ( a > b ) ? 1 : -1 );
            dates = dates.map( date => t2.formats.date( date ) );

        return dates;
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

    this.output = 
    {
        object: ( object, target ) =>
        {
            target.innerHTML = null;
            
            let output = t2.common.el( "div", target );
                output.classList.add( "flex" );

            for ( let prop in object )
            {     
                let key = document.createElement( "div" );
                    key.textContent = prop;
                    key.classList.add( "key" );

                output.appendChild( key );

                let value = document.createElement( "div" );
                    value.textContent = object[ prop ].toFixed( 1 );
                    value.classList.add( "key" );
                    value.classList.add( "cyan" );
                    value.style.minWidth = "25px";

                output.appendChild( value );
            }
            
            target.appendChild( output );
        }
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

    this.times = function( array )
    {
        let dates = array.map( date => new Date( date ) ); 
            dates.sort( ( a, b ) => ( a > b ) ? 1 : -1 );
        let times = dates.map( date => t2.formats.time( date ) );

        return times;
    };

    this.uuid = function()
    {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, ( c ) => 
        {
            var r =  ( dt + Math.random() * 16 ) %16 | 0;
            dt = Math.floor( dt / 16 );
            return ( c == 'x' ? r :( r&0x3 | 0x8 ) ).toString( 16 );
        } );

        return uuid;
    }
};

export default Common;