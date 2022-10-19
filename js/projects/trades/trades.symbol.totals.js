import Common from "../../t2/t2.common.handlers.js";
import totals from "./trades.calculate.totals.js";

const Panel = function( module )
{
    let self = this;
    let panel;

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

        let result = await totals( module );

        let container = await panel.addContainer( { id: "matrix", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `${ module.symbol } Totals` );

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
                input: { name: "percent", type: "number" }, 
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
                input: { name: "div qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
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
