const aggregate = function( symbol, records )
{
    let data  = this.data;
    let buy   = ( record ) => ( record.action == "BUY" );
    let div   = ( record ) => ( record.action == "DIV" );
    let sell  = ( record ) => ( record.action == "SELL" );
    let sum   = ( a, b )   => a + b;
    let prices = ( record ) => record.price;
    let value = ( record ) => record.qty * record.price * record.sign.value;
    let date  = ( string ) => Number( new Date( string ) );
    let asc   = [ ...records ].sort( ( a, b ) => date( b.datetime ) - date( a.datetime ) );
    let desc  = [ ...records ].sort( ( a, b ) => date( a.datetime ) - date( b.datetime ) );
    
    let aggregate = {};
        aggregate.id            = symbol;
        aggregate.symbol        = symbol;
        aggregate.first_price   = desc[ 0 ].price;
        aggregate.last_price    = asc[ 0 ].price;
        aggregate.trades        = records.length;
        aggregate.low           = Math.min.apply( null, records.map( prices ) );
        aggregate.high          = Math.max.apply( null, records.map( prices ) );

        //BUY
        let buy_array           = records.filter( buy );
        aggregate.buy_qty       = buy_array.map( record => record.qty ).reduce( sum, 0 );
        aggregate.buy_value     = buy_array.map( record => record.value ).reduce( sum, 0 );
        //aggregate.buy_value     = records.filter( buy  ).map( value ).reduce( sum, 0 );
        aggregate.buy_price     = Math.abs( aggregate.buy_value / aggregate.buy_qty );
        // DIV
        let div_array           = records.filter( div );
        aggregate.div_qty       = div_array.map( record => record.qty ).reduce( sum, 0 );
        aggregate.div_value     = div_array.map( record => record.value ).reduce( sum, 0 );
        //aggregate.div_value     = records.filter( div  ).map( value ).reduce( sum, 0 );      
        aggregate.div_price     = Math.abs( aggregate.div_value / aggregate.div_qty );
        // SELL
        let sell_array          = records.filter( sell );
        aggregate.sell_qty      = sell_array.map( record => record.qty ).reduce( sum, 0 );
        aggregate.sell_value    = sell_array.map( record => record.value ).reduce( sum, 0 );
        //aggregate.sell_value    = records.filter( sell ).map( value ).reduce( sum, 0 );
        aggregate.sell_price    = Math.abs( aggregate.sell_value / aggregate.sell_qty );
        // OPEN
        aggregate.open_qty      = Math.round( ( aggregate.buy_qty + aggregate.div_qty + aggregate.sell_qty ) * 10000 ) / 10000;
        aggregate.open_value    = aggregate.open_qty * aggregate.last_price;
        // CLOSED
        aggregate.closed_gain   = ( aggregate.sell_price - aggregate.buy_price ) * Math.abs( aggregate.sell_qty );
        // TOTAL
        aggregate.total_cost    = aggregate.buy_value + aggregate.sell_value;
        aggregate.share_price   = aggregate.open_qty ? Math.round( aggregate.last_price - ( aggregate.total_cost / aggregate.open_qty ) * 10000 ) / 10000 : aggregate.sell_price;
        aggregate.open_gain     = ( aggregate.last_price - aggregate.buy_price ) * aggregate.open_qty;
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
            
            aggregate[ brokerage ] = Math.round( ( qty.buy + qty.div + qty.sell ) * 10000 ) / 10000;
        } );

    return aggregate;
};

export default aggregate;