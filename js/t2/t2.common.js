const Common = function()
{
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

                        if ( predicate )
                        {
                            return;
                        }

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

    this.debug = function( string, color )
    {
        console.log( `%c ${ string }`, `background: ${ color };` );
    },

    this.delay = async function( fn, ms, ...args ) 
    {
        await this.sleep( ms );

        return fn( ...args );
    };

    this.el = ( tag, parent ) => 
    { 
        let el = document.createElement( tag ); 
        parent.appendChild( el );
        
        return el; 
    };

    this.Fulfill = function()
    {
        this.promises = [];

        this.add = ( promise ) => this.promises.push( promise );

        this.resolve = async ( callback ) => 
        {
            let result = await Promise.all( this.promises );

            if ( callback )
                callback( result );

            return result;
        };
    };

    this.getCSS = function( el, prop )
    {
        let style = getComputedStyle( el );
        let array = style[ prop ].split( " " ).map( val => parseInt( val ) );

        return array.reduce( ( a, b ) => a + b, 0 );
    };
    
    this.getParent = function( elParams )
    {
        elParams.parent = ( typeof elParams.parent == "object" ) ? elParams.parent : document.getElementById( elParams.parent );

        return elParams.parent;
    };

    this.ignored = function( f, child )
    {
        let ignore = child.dataset.ignore ? child.dataset.ignore.split( "," ) : [];
        
        return !!ignore.find( dataset => f == dataset );
    };

    this.log = function ()
    {
        let array = [ ...arguments ];
            array.splice( 0, 1 );
        let string = array.join( " " );

        console.log( `%c ${ string }`, `background: ${ arguments[ 0 ] };` );
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

    this.reset = ( ids ) => 
    { 
        ids.forEach( id => 
        {              
            let component = t2.ui.children.get( id );
            let el = component.element;
            if ( el )
            {
                let children = Array.from( el.children );
                    children.forEach( child =>
                    {   
                        let predicate = this.ignored( "clear", child );

                        if ( predicate )
                        {
                            component.hide();
                            
                            return;
                        }
                        
                        el.removeChild( child );
                    } );
            }
        } );
    };

    this.round = ( value, precision ) => Math.round( ( value * Math.pow( 10, precision ) / Math.pow( 10, precision ) ) );

    this.sleep = function( ms )  
    {
        return new Promise( resolve => setTimeout( resolve, ms ) );
    };
    
    this.sort = ( array, key, dir ) => 
    {
        let c = [ "asc", "desc" ].indexOf( dir );

        if ( c == -1 )
            c = 1;
        else if ( c == 0 )
            c = 1;
        else
            c = -1;

        let d = -c;

        return array.sort( ( a, b ) => ( key ? a[ key ] > b[ key ] : a > b ) ? c : d );
    };

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
    };
};

export default Common;