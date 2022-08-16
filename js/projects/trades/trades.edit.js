import { aggregate, reset, total } from "./trades.aggregate.js";
import totals from "./trades.totals.js";

const Transactions = function( module )
{
    let self = this;
    let map = new Map();

    this.init = async function()
    {
        if ( !module.symbol )
            return;

        t2.ui.breadcrumbs[ 2 ] = module.symbol;

        // initialize actions map
        module.actions.forEach( action => map.set( action, [] ) );

        // filter by symbol
        this.array = module.data.all.filter( record => record.symbol == module.symbol );

        // split actions
        this.array.forEach( record => map.get( record.action ).push( record ) );

        let promises = [];

        // display tables
        module.actions.forEach( ( action ) => promises.push( display( action ) ) );

        reset();
        aggregate( module.symbol, this.array );
        totals( total );

        await Promise.all( promises );

        return this;
    };

    async function display( action )
    {
        let container = await t2.ui.addComponent( { id: action, title: `${ action } ${ module.symbol }`, component: "container", parent: t2.ui.elements.get( "content" ), module: module } );
        
        let table = await t2.ui.addComponent( { id: "table", component: "table", parent: container.element, module: module } );
            table.handlers = { row: ( e, record ) => module.handlers.row( e, record ), update: ( e, record ) => module.handlers.update( e, record ) };    
            table.addColumn( { 
                input: { name: "id", type: "hidden" }, 
                cell: { css: {}, display: 0, modes: [ "edit" ] },
                format: [] } );
            table.addColumn( { 
                input: { name: "datetime", type: "datetime" }, 
                cell: { css: { class: "date" }, display: 12, modes: [ "read", "edit" ] },
                format: [ "date&time" ],
                handler: async ( cell, record ) => 
                {
                    module.view = "date";
                    await module.setDate( record );
                } } );
            table.addColumn( { 
                input: { name: "symbol", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "action", type: "text" }, 
                cell: { css: { value: null }, display: 3, modes: [ "read", "edit" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "notes", type: "text" }, 
                cell: { css: { value: "action" }, display: 4, modes: [ "read", "edit" ] },
                handler: async ( cell, record ) => 
                {
                    module.view = "short";
                    module.refresh( record );
                } } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 0.0001 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read", "edit" ] } } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.0001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read", "edit" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "precision" ],
                formula: ( args ) => 
                {
                    args.totals[ args.column ] += args.value;
                    args.totals.price = args.totals.value / args.totals.qty;

                    return args.value;
                } } );
            table.addColumn( { 
                input: { name: "brokerage", type: "text" }, 
                cell: { css: {}, display: 6, modes: [ "edit" ] },
                format: [] } );
            table.addColumn( { 
                input: { type: "submit", value: "UPDATE" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            table.setColumns( module.mode );
            table.populate( { array: map.get( action ), orderBy: "price" } );  
            table.setTotals();  
            table.totals.action = action;
            
        return table.totals;
    }
};

export default Transactions;