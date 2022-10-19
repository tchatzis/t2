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
        
        let object = {};
            object.brokerage = brokerage;
            object.data = {};

            object.data.TOTAL = {};
            [ "qty", "value" ].forEach( prop => object.data.TOTAL[ prop ] = 0 ); 

        module.data.actions.forEach( action => 
        {
            let div = action == "DIV" ? 1 : -1;
            
            object.data[ action ] = {};
            object.data[ action ].records   = records.filter( record => ( record.action == action && record.brokerage == brokerage ) );
            object.data[ action ].transactions = object.data[ action ].records.length;
            object.data[ action ].qty       = round( object.data[ action ].records.map( record => record.qty * record.sign * div ).reduce( sum, 0 ) );
            object.data[ action ].price     = round( object.data[ action ].records.map( record => record.price ).reduce( sum, 0 ) / object.data[ action ].transactions ) || 0;
            object.data[ action ].value     = round( object.data[ action ].qty * object.data[ action ].price );

            if ( action !== "DIV" )
            {
                [ "qty", "value" ].forEach( prop => object.data.TOTAL[ prop ] += object.data[ action ][ prop ] );  
                [ "qty", "value" ].forEach( prop => object.data.TOTAL[ prop ] = round( object.data.TOTAL[ prop ] ) ); 
            }
        } );

        object.data.TOTAL.average = round( !object.data.TOTAL.qty ? object.data.BUY.price : object.data.SELL.price );
        object.data.TOTAL.gain = round( object.data.TOTAL.average * object.data.TOTAL.qty - object.data.TOTAL.value );
        
        data.push( object );

        output.data[ "buy qty" ] = object.data.BUY.qty;
        output.data[ "buy average price" ] = object.data.BUY.price;
        output.data[ "buy cost" ] = object.data.BUY.value;
        output.data[ "buy trades" ] = object.data.BUY.transactions; 

        output.data[ "sell qty" ] = object.data.SELL.qty;
        output.data[ "sell average price" ] = round( object.data.SELL.value / object.data.SELL.qty );
        output.data[ "sell value" ] = -object.data.SELL.value;
        output.data[ "sell trades" ] = object.data.SELL.transactions; 

        output.data[ "div qty" ] = object.data.DIV.qty;
        output.data[ "dividend" ] = object.data.DIV.value;
        output.data[ "deposits" ] = object.data.DIV.transactions; 

        output.data.position = object.data.TOTAL.qty + object.data.DIV.qty;

        if ( object.data.TOTAL.qty ) 
        {
            output.data[ "break even" ] = round( object.data.TOTAL.value / object.data.TOTAL.qty );
            output.data.status = "OPEN";
        }
        else
        {
            output.data[ "break even" ] = object.data.BUY.price;
            output.data.status = "CLOSED";
        }

        output.data.gain = object.data.TOTAL.gain;
        output.data[ "percent" ] = round( ( object.data.TOTAL.gain / object.data.BUY.value ) * 100 );

        result.push( output ); 
    } );

    return result;
}

export default totals;