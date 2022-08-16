const Data = function( data, create )
{
    if ( data.symbol )
        this.symbol = data.symbol;

    if ( data.action )   
    { 
        this.action = data.action;
        this.sign = ( data.action == "SELL" ) ? -1 : 1;
    }

    if ( data.hasOwnProperty( "notes" ) )    
        this.notes = data.notes;
    
    if ( data.hasOwnProperty( "qty" ) )
        this.qty = Math.round( Math.abs( Number( data.qty ) ) * 1000 ) / 1000 * this.sign;

    if ( data.hasOwnProperty( "price" ) )
        this.price = Number( data.price );
    if ( data.action == "DIV" )
        this.price = Math.abs( this.price ) * -1;

    if ( data.hasOwnProperty( "qty" ) && data.hasOwnProperty( "price" ) )
        this.value = Math.round( this.qty * this.price * 100 ) / 100;

    if ( data.brokerage ) 
        this.brokerage = data.brokerage;

    if ( data.datetime )
        this.datetime = data.datetime.replace( " ", "T" );
    else
        this.datetime = t2.formats.datetime( new Date() );
};

export default Data;
