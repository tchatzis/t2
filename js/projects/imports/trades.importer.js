const Importer = function()
{
    let self = this;
    const actions = [ "BUY", "SELL" ];
    let args = arguments[ 0 ];
    let trades;
    
    const Data = 
    {     
        Robinhood: function( line )
        {
            let a = line.split( " " );
            let offset = a.length - 7;

            this.symbol = a[ 0 ];
            this.action = a[ 2 ];
            this.notes = "";
            this.sign = actions.indexOf( this.action ) * 2 - 1;
            this.date = a[ 3 ].toLocaleDateString();
            this.qty = Number( a[ 4 + offset ] );
            this.price = Number( a[ 5 + offset ] );
            this.value = Math.round( this.qty * this.price * 100 ) / 100; 
            this.brokerage = "Robinhood";
            
            return this;
        },
        
        TDAmeritrade: function( line )
        {
            let a = line.split( " " );
            let offset = 0;
            let notes;
            let types = [ "COVER", "SHORT" ];
            let options = [ "BUY", "SELL", "BUY TO COVER", "SELL SHORT" ];
                options.forEach( action =>
                {
                    let a = action.split( " " );
                    notes = types.find( ( type, index ) => ( line.includes( type ) && line.includes( actions[ index ] ) ) );
                    let hasAction = line.includes( action );

                    if ( hasAction && notes )
                    {
                        offset = a.length - 1;
                        this.action = a[ 0 ];
                        this.notes = notes;
                    }
                    else if ( hasAction )
                    {
                        offset = a.length - 1;
                        this.action = a[ 0 ];
                        this.notes = "";
                    }
                } );

            this.sign = actions.indexOf( this.action ) * 2 - 1;
            this.qty = Number( a[ 1 + offset ] );
            this.symbol = a[ 2 + offset ];
            this.price = Number( a[ 4 + offset ] );
            this.time = a[ 5 + offset ];
            this.date = a[ 6 + offset ].toLocaleDateString();
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
            self.init();
            
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
            
            //console.error( "records", array.length, !( array.length % lines ), scrubbed.length );  
            return scrubbed.map( line => new Data[ brokerage ]( line ) );
        },
        
        TDAmeritrade: function( brokerage )
        {
            self.init();
            
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

            return scrubbed.map( line => new Data[ brokerage ]( line ) );            
        }
    };

    this.init = function()
    {
        trades = args.input.textContent;
    };
    
    this.scrub = ( brokerage ) => scrubbers[ brokerage ]( brokerage );

    this.save = function( table, array, bool )
    {
        let index = 0;
        let length = array.length;

        async function transaction( record )
        {
            let data = { ... record };
            delete data.index;
            delete data.list;
            delete data.row;

            if ( bool )
                await t2.db.tx.create( table, data );
            else
                console.log( data );

            index++;

            if ( index < length )
                transaction( array[ index ] );
        }

        transaction( array[ index ] );
    };
};

export default Importer;