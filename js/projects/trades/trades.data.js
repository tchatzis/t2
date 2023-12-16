const Data = function( data )
{
    if ( !data.symbol )
        throw( "symbol is required" );

    this.symbol = data.symbol.trim().toUpperCase();

    if ( !data.action )   
        throw( "action is required" );

    this.action = data.action.trim().toUpperCase();

    switch( this.action )
    { 
        case "BUY":
            this.sign = { qty: 1, value: -1 };
        break;

        case "DIV":
            this.sign = { qty: 1, value: 1 };
        break;

        case "SELL":
            this.sign = { qty: -1, value: -1 };
        break;

        default:
            throw( `${ this.action } is not valid` );
    }

    if ( data.hasOwnProperty( "notes" ) )    
        this.notes = data.notes;
    
    if ( data.hasOwnProperty( "qty" ) )
        this.qty = Math.round( Math.abs( Number( data.qty ) ) * this.sign.qty * 1000 ) / 1000;

    if ( data.hasOwnProperty( "price" ) )
        this.price = Math.abs( Number( data.price ) );

    if ( data.hasOwnProperty( "qty" ) && data.hasOwnProperty( "price" ) )
        this.value = Math.round( this.qty * this.price * this.sign.value * 100 ) / 100;

    if ( data.brokerage ) 
        this.brokerage = data.brokerage;

    if ( data.datetime )
        this.datetime = data.datetime;
    else
        this.datetime = t2.formats.datetime( new Date() );

    delete data.source;
};

export default Data;
