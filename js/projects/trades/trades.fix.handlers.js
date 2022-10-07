import Data from "./trades.data.js";

const handlers = 
{
    alter: function( table, data, params )
    {
        data.forEach( async ( record ) => 
        {
            record[ params.key ] = params.to;

            console.log( new Data( record ) );


            //await t2.db.tx.update( table, record.id, new Data( record ) );
        } );
    },   
    
    normalize: function( table, data )
    {
        console.log( table, data )
        //data.forEach( async ( record ) => await t2.db.tx.update( table, record.id, new Data( record ) ) );
    },

    rename: function( table, data, params )
    {
        data.forEach( async ( record ) => 
        {
            record.symbol = params.to.toUpperCase();
            console.log( record );

            //await t2.db.tx.update( table, record.id, record );
        } );
    },

    repair: function( table, data, params )
    {
        console.log( data );
        
        //await t2.db.tx.overwrite( table, params.id, data );
    }
};

function fix()
{
    /* clean up reverse split
    let data = self.data.all.filter( record => record.symbol == "SNDL" );
        data.forEach( async ( record ) => 
        {
            if ( record.brokerage == "TDAmeritrade" )
            {
                record.qty /= 10;
                record.price *= 10;
            }

            await t2.db.tx.update( self.table, record.id, new Data( record ) );
        } );
    */

    /* update symbol
    let data = 
    */

    /*
    let data = self.data.all;//.filter( record => ( record.action == "SELL" ) );
        data.forEach( async ( record ) => 
        {
            //record.action = "DIV";
            record.sign = ( record.action == "SELL" ) ? -1 : 1;
            record.qty = Math.abs( record.qty ) * record.sign;
            //record.brokerage = "TDAmeritrade";
            //record.notes = "";
            //record.sign = -1;
            //record.symbol = "ARCC";
            record.value = record.price * record.qty;
            console.log( record )

            await t2.db.tx.update( self.table, record.id, record );
        } );
    */

    /*let data = self.data.all;//.filter( record => record.symbol !== "TEST" );
        data.forEach( async ( record ) => 
        {   
            //let datetime = t2.common.addTime( record.date, record.time );
            
            //record.datetime = t2.formats.datetime( datetime );
            //record.date = t2.formats.isoDate( record.date );

            //await t2.db.tx.update( self.table, record.id, record );
            //console.log( record.id, record.datetime );
        } );*/

    /*let data = self.data.all.filter( record => record.id == 1561 );
        data.forEach( async ( _record ) => 
        {   
            let record =
            {
                action: _record.action,
                brokerage: _record.brokerage,
                datetime: _record.datetime,
                id: _record.id,
                notes: _record.notes,
                price: _record.price,
                qty: _record.qty,
                sign: _record.sign,
                symbol: _record.symbol,
                value: _record.value
            };

            await t2.db.tx.overwrite( self.table, record.id, record );     
        } );*/

    /*let data = self.data.all.filter( record => record.id == 1562 );
        data.forEach( async ( _record ) => 
        {   
            let record =
            {
                action: "SELL",
                brokerage: _record.brokerage,
                datetime: _record.datetime,
                id: _record.id,
                notes: _record.notes,
                price: 6.35,
                qty: 100,
                sign: -1,
                symbol: _record.symbol,
                value: -635
            };

            console.log( _record, record );

            let result = await t2.db.tx.overwrite( self.table, record.id, record ); 
            console.log( result );    
        } );*/


}

export default handlers;