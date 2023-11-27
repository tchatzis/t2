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
        // CLOSED
        aggregate.closed_gain   = ( aggregate.sell_price - aggregate.buy_price ) * aggregate.sell_qty;
        // TOTAL
        aggregate.total_cost    = -( aggregate.sell_value - aggregate.buy_value );
        aggregate.share_price   = aggregate.open_qty ? Math.round( ( aggregate.total_cost / aggregate.open_qty ) * 10000 ) / 10000 : aggregate.sell_price;
        aggregate.open_gain     = ( aggregate.last_price - aggregate.share_price ) * aggregate.open_qty;
        aggregate.total_gain    = aggregate.open_gain + aggregate.closed_gain;  
        aggregate.total_net     = aggregate.total_gain + aggregate.div_value;
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

    return aggregate;
};

export default aggregate;