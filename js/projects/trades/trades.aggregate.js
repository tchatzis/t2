let total;

const reset = () => total = { open: 0, closed: 0, buy: 0, bought: 0, sell: 0, sold: 0, div: 0, dividend: 0, qty: 0 };

const aggregate = function( symbol, records )
{
    let buy   = ( record ) => ( record.action == "BUY" );
    let div   = ( record ) => ( record.action == "DIV" );
    let sell  = ( record ) => ( record.action == "SELL" );
    let sum   = ( a, b )   => a + b;
    let value = ( record ) => record.qty * record.price;
    
    let aggregate = {};
        aggregate.id        = symbol;
        aggregate.symbol    = symbol;
        aggregate.trades    = records.length;
        aggregate.low       = 0;
        aggregate.high      = 0;
        aggregate.buy       = records.filter( buy  ).map( record => record.qty ).reduce( sum, 0 );
        aggregate.bought    = records.filter( buy  ).map( value ).reduce( sum, 0 );
        aggregate.div       = records.filter( div  ).map( record => record.qty ).reduce( sum, 0 );
        aggregate.dividend  = records.filter( div  ).map( value ).reduce( sum, 0 );        
        aggregate.sell      = records.filter( sell ).map( record => record.qty ).reduce( sum, 0 );
        aggregate.sold      = records.filter( sell ).map( value ).reduce( sum, 0 );
        aggregate.qty       = aggregate.buy + aggregate.div + aggregate.sell;
        aggregate.gain      = records.map( record => -record.qty * record.price ).reduce( sum, 0 );
        aggregate.price     = aggregate.gain / aggregate.buy;

    total.columns = [];
    total.open      += aggregate.qty ? aggregate.gain : 0;
    total.closed    += aggregate.qty ? 0 : aggregate.gain;
    total.buy       += aggregate.buy;
    total.bought    += aggregate.bought;
    total.div       += aggregate.div;
    total.dividend  += aggregate.dividend * -1;
    total.sell      += aggregate.sell;
    total.sold      += aggregate.sold;
    total.qty       += aggregate.qty;
    total.price     =  total.qty ? total.open / total.qty : total.sold / total.sell;
    total.gain      =  -( total.bought + total.sold + total.open );

    for ( let key in total )
    {
        if ( total[ key ] )
            total.columns.push( { [ key ]: total[ key ] } );
    }

    return aggregate;
};

export { aggregate, reset, total };