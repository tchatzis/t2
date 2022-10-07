import { aggregate, reset, total } from "./trades.aggregate.js";
import totals from "./trades.totals.js";
import Data from "./trades.data.js";

const Summary = function( module )
{
    let self = this;
    
    this.init = async function()
    {
        layout();
        
        let array = preamble();

        await summary( array );
        await dividends( );

        totals( total );

        let symbols = t2.ui.children.get( "menu.symbols" );
            symbols.show();
    };

    function preamble()
    {
        let array = [];

        reset();

        module.data.symbol.forEach( symbol => 
        {
            let records = module.data.all.filter( record => record.symbol == symbol );

            array.push( aggregate( symbol, records ) );
        } );

        return array;
    }

    async function layout()
    {
        let symbols = t2.ui.children.get( "menu.symbols" );
            symbols.show();

        let date = t2.ui.children.get( "submenu.date" );
            date.hide();
    }

    // summary
    async function summary( array )
    {
        let content = t2.ui.children.get( "content" );
        let container = await content.addContainer( { id: "day", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format:"block", output: "text" } );
            title.set( "Summary" );

        let qty = { predicate: { conditions: [ { name: "qty", operator: ">", value: 0 } ], options: [ "active", "inactive" ] } };      
        let average = { predicate: { conditions: [ { name: "qty", operator: "==", value: 0 }, { name: "average", operator: ">", value: 0 } ], options: [ "buy", "value" ] } };  
        let gain = { predicate: { conditions: [ { name: "qty", operator: "==", value: 0 }, { name: "gain", operator: "<=", value: 0 } ], options: [ "sell", "value" ] } };
        let dividend = { predicate: { conditions: [ { name: "dividend", operator: ">", value: 0 } ], options: [ "buy", "value" ] } }; 

        let table = await container.addComponent( { id: "aggregates", type: "table" } );  
            table.addColumn( { 
                input: { name: "symbol", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "trades", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "div", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "buy", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "sell", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 1, min: 0 }, 
                cell: { css: qty, display: 3, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "average", type: "number", step: 0.001 }, 
                cell: { css: average, display: 4, modes: [ "read" ] },
                format: [ "precision" ],
                formula: ( args ) =>
                {
                    args.totals[ args.column ] = 0;

                    return args.value;
                } } );
            table.addColumn( { 
                input: { name: "gain", type: "number", readonly: "" }, 
                cell: { css: gain, display: 6, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) => 
                { 
                    if ( !args.record.qty ) 
                    {
                        args.totals[ args.column ] += args.value;
                    }

                    return args.value;
                } } );
            table.addColumn( { 
                input: { name: "dividend", type: "number", readonly: "" }, 
                cell: { css: dividend, display: 4, modes: [ "read" ] },
                format: [ "dollar" ] } );
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "symbol" } );
            table.setTotals();
            table.highlight( module.symbol );
    }

    // dividends
    async function dividends()
    {
        let array = module.data.all.filter( record => ( record.action == "DIV") );

        let content = t2.ui.children.get( "content" );
        let container = await content.addContainer( { id: "day", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( "Dividends" );

        let table = await container.addComponent( { id: "dividends", type: "table" } );
            table.addRowListener( { type: "contextmenu", handler: table.edit } );
            table.addSubmitListener( { type: "submit", handler: async function ( data )
            { 
                let form = this;

                let record = await t2.db.tx.update( module.table, Number( data.id ), new Data( data ) );

                form.parent.remove();

                table.normal( record.id );
            } } );
            table.addColumn( { 
                input: { name: "id", type: "hidden" }, 
                cell: { css: {}, display: 0, modes: [ "edit" ] },
                format: [ "isoDate" ] } );
            table.addColumn( { 
                input: { name: "datetime", type: "text" }, 
                cell: { css: { class: "date" }, display: 12, modes: [ "read", "edit" ] },
                format: [ "date&time" ] } );
            table.addColumn( { 
                input: { name: "action", type: "text", readonly: true }, 
                cell: { css: { value: "action" }, display: 4, modes: [ "read", "edit" ] } } );
            table.addColumn( { 
                input: { name: "symbol", type: "select" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [ "uppercase" ],
                options: module.data.symbol } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 0.0001, min: 0 }, 
                cell: { css: { class: "info" }, display: 4, modes: [ "read", "edit" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "buy" }, display: 4, modes: [ "read", "edit" ] },
                format: [ "precision" ],
                formula: ( args ) => args.value * -1 } );
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "precision" ], 
                formula: ( args ) => 
                {
                    args.totals.price = 0;
                    args.value *= -1;

                    args.totals[ args.column ] += args.value;

                    return args.value;
                } } );   
            table.addColumn( { 
                input: { name: "brokerage", type: "select" }, 
                cell: { css: {}, display: 8, modes: [ "read", "edit" ] },
                format: [],
                options: [ "TDAmeritrade", "JPMorganChase", "Robinhood" ] } );
            table.addColumn( { 
                input: { type: "submit", value: "UPDATE" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "symbol" } );
            table.setTotals();
    };
};

export default Summary;