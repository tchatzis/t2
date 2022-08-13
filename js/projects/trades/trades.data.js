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
        this.qty = Math.abs( Number( data.qty ) ) * this.sign;

    if ( data.hasOwnProperty( "price" ) )
        this.price = Number( data.price );

    if ( data.hasOwnProperty( "qty" ) && data.hasOwnProperty( "price" ) )
        this.value = Math.round( this.qty * this.price * 100 ) / 100;

    if ( data.brokerage ) 
        this.brokerage = data.brokerage;

    if ( data.date )     
        this.date = t2.formats.date( data.date );
    else if ( create )
        this.date = t2.formats.date( new Date() );

    if ( data.time ) 
        this.time = t2.formats.time( data.time );
    else if ( create )
        this.time = null;
};

export default Data;
