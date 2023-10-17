const aggregate = function( symbol, records )
{
    let data  = this.data;
    let buy   = ( record ) => ( record.action == "BUY" );
    let div   = ( record ) => ( record.action == "DIV" );
    let sell  = ( record ) => ( record.action == "SELL" );
    let sum   = ( a, b )   => a + b;
    let value = ( record ) => record.qty * record.price;
    let date  = ( string ) => Number( new Date( string ) );
    let asc   = [ ...records ].sort( ( a, b ) => date( b.datetime ) - date( a.datetime ) );
    let desc  = [ ...records ].sort( ( a, b ) => date( a.datetime ) - date( b.datetime ) );
    
    let aggregate = {};
        aggregate.id            = symbol;
        aggregate.symbol        = symbol;
        aggregate.first_price   = desc[ 0 ].price;
        aggregate.last_price    = asc[ 0 ].price;
        aggregate.trades        = records.length;
        aggregate.low           = 0;
        aggregate.high          = 0;

        //BUY
        let buy_array           = records.filter( buy  );
        aggregate.buy_qty       = buy_array.map( record => record.qty ).reduce( sum, 0 );
        aggregate.buy_value     = records.filter( buy  ).map( value ).reduce( sum, 0 );
        aggregate.buy_price     = aggregate.buy_value / aggregate.buy_qty;
        // DIV
        let div_array           = records.filter( div  );
        aggregate.div_qty       = div_array.map( record => record.qty ).reduce( sum, 0 );
        aggregate.div_value     = records.filter( div  ).map( value ).reduce( sum, 0 );      
        aggregate.div_price     = aggregate.div_value / aggregate.div_price;
        // SELL
        let sell_array          = records.filter( sell );
        aggregate.sell_qty      = sell_array.map( record => record.qty ).reduce( sum, 0 );
        aggregate.sell_value    = records.filter( sell ).map( value ).reduce( sum, 0 );
        aggregate.sell_price    = aggregate.sell_value / aggregate.sell_qty;
        // OPEN
        aggregate.open_qty      = Math.round( ( aggregate.buy_qty + aggregate.div_qty - aggregate.sell_qty ) * 10000 ) / 10000;
        aggregate.open_value    = aggregate.open_qty * aggregate.last_price;
        aggregate.open_price    = aggregate.open_value / aggregate.open_qty;
        aggregate.open_gain     = ( aggregate.open_price - aggregate.buy_price ) * aggregate.open_qty;
        // TOTAL
        aggregate.total_gain   = ( aggregate.sell_value - aggregate.buy_value ) + aggregate.open_value;  
        aggregate.total_net    = aggregate.total_gain + aggregate.div_value;
        // BROKERAGE
        data.brokerage.forEach( brokerage => 
        {
            let qty = {};

            [ "buy", "div", "sell" ].forEach( action => 
            {
                let array = eval( `${ action }_array` );  
                
                qty[ action ] = array.filter( record => record.brokerage == brokerage ).map( record => record.qty ).reduce( sum, 0 );
            } );
            
            aggregate[ brokerage ] = Math.round( ( qty.buy + qty.div - qty.sell ) * 10000 ) / 10000;
        } );

    /*total.columns = [];
    total.open      += Math.round( aggregate.qty ? aggregate.gain * 10000 : 0 ) / 10000;
    total.closed    += Math.round( aggregate.qty ? 0 : aggregate.gain * 10000 ) / 10000;
    total.buy       += aggregate.buy;
    total.bought    += aggregate.bought;
    total.div       += aggregate.div;
    total.dividend  += aggregate.dividend;
    total.sell      += Math.round( aggregate.sell * 10000 ) / 10000;
    total.sold      += aggregate.sold;
    total.qty       += aggregate.qty;
    total.average   =  Math.round( total.qty ? ( total.open / total.qty ) * 10000 : ( total.sold / total.sell ) * 10000 ) / 10000;
    total.gain      =  total.sold - total.bought + total.open;

    for ( let key in total )
    {
        if ( total[ key ] )
            total.columns.push( { [ key ]: total[ key ] } );
    }*/

    return aggregate;
};

export default aggregate;