async function totals( module )
{
    await module.queries();

    let sum = ( a, b ) => a + b;
    let round = ( value ) => Math.round( value * 10000 ) / 10000;

    let records = module.data.filtered;
    let brokerage = new Set( records.map( record => record.brokerage ) );

    const data = [];
    const result = [];

    Array.from( brokerage ).forEach( brokerage => 
    { 
        let output = {};
            output.brokerage = brokerage;
            output.data = {};
        let _last = records.filter( record => ( record.brokerage == brokerage ) );
        let last = _last[ _last.length - 1 ];
        
        let object = {};
            object.brokerage = brokerage;
            object.data = {};

            object.data.TOTAL = {};
            [ "qty", "value" ].forEach( prop => object.data.TOTAL[ prop ] = 0 ); 

        module.data.actions.forEach( action => 
        {
            let div = action == "DIV" ? 1 : -1;
            let _records = records.filter( record => ( record.action == action && record.brokerage == brokerage ) );
            let prices = _records.map( record => record.price );
            
            object.data[ action ] = {};
            object.data[ action ].records = _records;
            object.data[ action ].transactions = _records.length;
            object.data[ action ].qty   = round( _records.map( record => record.qty * record.sign * div ).reduce( sum, 0 ) );
            object.data[ action ].value = round( _records.map( record => record.value * record.sign * div ).reduce( sum, 0 ) );
            object.data[ action ].price = round( object.data[ action ].value / object.data[ action ].qty );
            object.data[ action ].low   = Math.min.apply( null, prices );
            object.data[ action ].high   = Math.max.apply( null, prices );

            if ( last )
                output.data[ "last price" ] = round( last.price );

            if ( action !== "DIV" )
            {
                [ "qty", "value" ].forEach( prop => object.data.TOTAL[ prop ] += object.data[ action ][ prop ] );  
                [ "qty", "value" ].forEach( prop => object.data.TOTAL[ prop ] = round( object.data.TOTAL[ prop ] ) ); 
            }
        } );

        data.push( object );

        output.data[ "buy qty" ] = object.data.BUY.qty;
        output.data[ "buy price" ] = round( object.data.BUY.value / object.data.BUY.qty );
        output.data[ "buy value" ] = object.data.BUY.value;
        output.data[ "buy trades" ] = object.data.BUY.transactions; 

        output.data[ "sell qty" ] = object.data.SELL.qty;
        output.data[ "sell price" ] = round( object.data.SELL.value / object.data.SELL.qty ) || 0;
        output.data[ "sell value" ] = -object.data.SELL.value;
        output.data[ "sell trades" ] = object.data.SELL.transactions; 

        output.data[ "div qty" ] = object.data.DIV.qty;
        output.data[ "dividend" ] = object.data.DIV.value;
        output.data[ "deposits" ] = object.data.DIV.transactions; 

        object.data.TOTAL.qty = round( object.data.TOTAL.qty + object.data.DIV.qty );

        output.data[ "qty" ] = object.data.TOTAL.qty;
        output.data[ "low" ] = Math.min( object.data.BUY.low, object.data.SELL.low );
        output.data[ "high" ] = Math.max( object.data.BUY.high, object.data.SELL.high );

        if ( object.data.TOTAL.qty ) 
        {
            output.data[ "trade" ] = round( object.data.TOTAL.value / object.data.TOTAL.qty );
            output.data[ "status" ] = "OPEN";
            output.data[ "spread" ] = round( object.data.BUY.price - output.data[ "trade" ] );
            output.data[ "trend" ] = round( ( output.data[ "last price" ] - output.data[ "trade" ] ) * object.data.TOTAL.qty );  
            output.data[ "value" ] = round( object.data.TOTAL.value );
            output.data[ "gain" ] = round( output.data[ "spread" ] * ( output.data[ "qty" ] || output.data[ "buy qty" ] ) );
        }
        else
        {
            output.data[ "trade" ] = object.data.BUY.price;
            output.data[ "status" ] = "CLOSED";
            output.data[ "spread" ] = round( object.data.SELL.price - object.data.BUY.price );
            output.data[ "trend" ] = 0;
            output.data[ "gain" ] = round( 0 - object.data.TOTAL.value );
        }

        output.data[ "percent" ] = round( ( output.data.gain / object.data.BUY.value ) * 100 );

        result.push( output ); 
    } );

    return result;
}

export default totals;