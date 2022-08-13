import { aggregate, reset, total } from "./trades.aggregate.js";
import totals from "./trades.totals.js";

const Summary = function( module )
{
    let self = this;
    
    this.init = async function()
    {
        await summary();
        await dividends();
        totals( total );
    };

    // summary
    async function summary()
    {
        let array = [];

        reset();

        module.data.symbol.forEach( symbol => 
        {
            let records = module.data.all.filter( record => record.symbol == symbol );

            array.push( aggregate( symbol, records ) );
        } );

        await display( array );
    }

    async function display( array )
    {
        let container = await t2.ui.addComponent( { id: "summary", title: "Summary", component: "container", parent: t2.ui.elements.get( "content" ), module: module } );

        let table = await t2.ui.addComponent( { id: "aggregates", component: "table", parent: container.element, module: module } );
            table.addColumn( { 
                input: { name: "symbol", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "trades", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "buy", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "div", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "sell", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 1, min: 0 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read" ] },
                format: [ "precision" ],
                formula: ( args ) =>
                {
                    args.totals[ args.column ] = 0;

                    return args.record.qty ? args.record.gain / args.record.qty : args.value;
                } } );
            table.addColumn( { 
                input: { name: "gain", type: "number", readonly: "" }, 
                cell: { css: { predicate: { conditions: [ { name: "qty", operator: "==", value: 0 }, { name: "gain", operator: "<=", value: 0 } ], options: [ "sell", "value" ] } }, display: 6, modes: [ "read" ] },
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
                cell: { css: { class: "value" }, display: 4, modes: [ "read" ] },
                format: [ "dollar" ] } );
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "symbol" } );
            table.setTotals();
    }

    // dividends
    async function dividends()
    {
        let array = module.data.all.filter( record => ( record.action == "DIV") );

        let container = await t2.ui.addComponent( { id: "dividends", title: "Dividends", component: "container", parent: t2.ui.elements.get( "content" ), module: module } );

        let table = await t2.ui.addComponent( { id: "dividends", component: "table", parent: container.element, module: module } );
            table.addColumn( { 
                input: { name: "date", type: "text" }, 
                cell: { css: { column: "" }, display: 6, modes: [ "read" ] },
                format: [ "date" ] } );
            table.addColumn( { 
                input: { name: "action", type: "text" }, 
                cell: { css: { value: "action" }, display: 4, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "symbol", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 1, min: 0 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "buy" }, display: 4, modes: [ "read" ] },
                format: [ "precision" ],
                formula: ( args ) => args.value * -1 } );
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "buy" }, display: 6, modes: [ "read" ] },
                format: [ "precision" ], 
                formula: ( args ) => 
                {
                    args.totals.price = 0;
                    args.value *= -1;

                    args.totals[ args.column ] += args.value;

                    return args.value;
                } } );   
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "symbol" } );
            table.setTotals();
    };
};

export default Summary;