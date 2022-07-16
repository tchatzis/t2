import trades from "./trades.raw.js";

const Importer = function()
{
    const actions = [ "BUY", "SELL" ];
    
    const Data = 
    {     
        Robinhood: function( line )
        {
            let a = line.split( " " );
            let offset = a.length - 7;

            this.symbol = a[ 0 ];
            this.action = a[ 2 ];
            this.sign = actions.indexOf( this.action ) * 2 - 1;
            this.date = a[ 3 ];
            this.qty = Number( a[ 4 + offset ] );
            this.price = Number( a[ 5 + offset ] );
            this.value = Math.round( this.qty * this.price * 100 ) / 100; 
            this.brokerage = "Robinhood";
            
            return this;
        },
        
        TDAmeritrade: function( line )
        {
            let a = line.split( " " );

            this.action = a[ 0 ];
            this.sign = actions.indexOf( this.action ) * 2 - 1;
            this.qty = Number( a[ 1 ] );
            this.symbol = a[ 2 ];
            this.price = Number( a[ 4 ] );
            this.time = a[ 5 ];
            this.date = a[ 6 ];
            this.value = Math.round( this.qty * this.price * 100 ) / 100;
            this.brokerage = "TDAmeritrade";

            return this;
        }
    };
    
    const remove = ( search, regex, replace ) => search.replace( regex, replace );

    const scrubbers =
    {
        Robinhood: function( brokerage )
        {
            let array = trades.split( "\n" );
            let scrubbed = [];
            let lines = 3;
            let temp = [];
            let deletions = [];

            array = array.filter( item => !!item );                         // remove blank elements
            
            let length = array.length - 1;

            // remove deposits
            for ( let index = length; index >= 0; index-- )
            {
                let line = array[ index ];

                if ( line.includes( "ACH Deposit" ) )
                    array.splice( index, 1 );
            }

            // select third line of record
            array.forEach( ( line, index ) =>
            {
                let mod = index % lines;

                if ( mod == 2 )  
                {
                    line = remove( line, new RegExp( "\\$", "g" ), "" );    // remove $
                    line = line.toUpperCase();
                     
                    scrubbed.push( line ); 
                }
            } );
            
            console.error( "records", array.length, !( array.length % lines ), scrubbed.length );  
            return scrubbed.map( line => { return { data: new Data[ brokerage ]( line ) } } );
        },
        
        TDAmeritrade: function( brokerage )
        {
            let array = trades.split( "Filled" );
            let scrubbed = [];
            
            array = array.filter( item => !!item );                         // remove blank elements
            
            array.forEach( line => 
            {
                line = remove( line, new RegExp( "\n", "g" ), "" );         // replace newline
                line = remove( line, new RegExp( "--", "g" ), "" );         // replace literal
                line = remove( line, new RegExp( /\s\s+/, "g" ), " " );     // replace multiple spaces
                line = remove( line, new RegExp( /\t\t+/, "g" ), "\t" );    // replace multiple tabs
                line = remove( line, new RegExp( /\t/, "g" ), " " );        // replace tabs with spaces
                line = remove( line, new RegExp( /^\s+/, "g" ), "" );       // trim leading whitespace
                line = remove( line, new RegExp( /\s+$/, "g" ), "" );       // trim trailing whitespace
                line = line.toUpperCase();

                if ( line.length )
                    scrubbed.push( line );
            } );

            return scrubbed.map( line => { return { data: new Data[ brokerage ]( line ) } } );            
        }
    };
    
    this.scrub = ( brokerage ) => scrubbers[ brokerage ]( brokerage );
};

export default Importer;