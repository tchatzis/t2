import Common from "../../t2/t2.common.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let sum = ( a, b ) => a + b;
    let round = ( value ) => Math.round( value * 10000 ) / 10000;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this ); 
    };

    this.run = async function()
    {
        panel.clear();

        await module.queries();

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
            output.data[ "sell average price" ] = object.data.TOTAL.average;
            output.data[ "sell value" ] = -object.data.SELL.value;
            output.data[ "sell trades" ] = object.data.SELL.transactions; 

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

            result.push( output );
        } );


        console.log( data );
        console.log( result );

        let container = await panel.addContainer( { id: "matrix", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Matrix Test` );

        let matrix = await container.addComponent( { id: "matrix", type: "matrix", format: "table-body" } );
            //matrix.addColumnListener( { type: "click", handler: matrix.edit } );
            //matrix.addRowListener( { type: "click", handler: ( a, b, c ) => console.log( a, b, c ) } );
            /*matrix.addSubmitListener( { type: "submit", handler: async ( args ) =>
            { 
                console.log( args, matrix.row.name, args[ matrix.row.name ] );

                let data = args[ matrix.row.name ];

                // format the data
                for ( let key in data )
                {
                    let config = args.config.get( key );
                    let value = data[ key ];

                    config.format.forEach( f => value = t2.formats[ f ]( value ) ); 
                    
                    data[ key ] = value;
                }

                let formatted = Object.assign( args.data, { [ matrix.row.name ]: data } );

                console.warn( Number( args.data[ matrix.primaryKey ] ), formatted ); 

                //let record = await t2.db.tx.update( "table", Number( data[ matrix.primaryKey ] ), formatted );

                matrix.populate();

                let message = await container.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                    message.set( `Updated ${ args.data[ matrix.primaryKey ] }` );  
            } } );*/
            matrix.addRow( { 
                input: { name: "status", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] 
            } );
            matrix.addRow( { 
                input: { name: "position", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number"  ] 
            } );            
            matrix.addRow( { 
                input: { name: "break even", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [ "number" ] 
            } );
            matrix.addRow( { 
                input: { name: "gain", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ]
            } );
            matrix.addRow( { 
                input: { name: "BUYS", type: "text" }, 
                cell: { css: { class: "buy" }, display: 4, modes: [ "read" ] },
                format: [ "null" ]
            } );
            matrix.addRow( { 
                input: { name: "buy qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "buy average price", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "buy cost", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "buy trades", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "SELLS", type: "text" }, 
                cell: { css: { class: "sell" }, display: 4, modes: [ "read" ] },
                format: [ "null" ]
            } );
            matrix.addRow( { 
                input: { name: "sell qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "sell average price", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "sell value", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "sell trades", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "DIVIDENDS", type: "text" }, 
                cell: { css: { class: "sell" }, display: 4, modes: [ "read" ] },
                format: [ "null" ]
            } );
            matrix.addRow( { 
                input: { name: "dividend", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "deposits", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );                
            matrix.populate(
            { 
                data: result, 
                primaryKey: "id",
                column: { name: "brokerage" },
                row: { name: "data" }
            } );
    };
};

export default Panel;
