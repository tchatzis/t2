const Data = function( data )
{
    if ( data.symbol )
        this.symbol = data.symbol.toUpperCase();

    if ( data.action )   
    { 
        this.action = data.action.toUpperCase();
        this.sign = ( data.action == "BUY" ) ? -1 : 1;
    }

    if ( data.hasOwnProperty( "notes" ) )    
        this.notes = data.notes;
    
    if ( data.hasOwnProperty( "qty" ) )
        this.qty = Math.round( Math.abs( Number( data.qty ) ) * 1000 ) / 1000;

    if ( data.hasOwnProperty( "price" ) )
        this.price = Math.abs( Number( data.price ) );

    if ( data.hasOwnProperty( "qty" ) && data.hasOwnProperty( "price" ) )
        this.value = Math.round( this.qty * this.price * 100 ) / 100;

    if ( data.brokerage ) 
        this.brokerage = data.brokerage;

    if ( data.datetime )
        this.datetime = data.datetime;
    else
        this.datetime = t2.formats.datetime( new Date() );
};

export default Data;
