import { aggregate, reset, total } from "./trades.aggregate.js";
import totals from "./trades.totals.js";

const Day = function( module )
{
    let self = this;

    this.init = async function()
    {
        reset();

        module.data.symbol.forEach( symbol => 
        {
            let records = module.data.all.filter( record => record.symbol == symbol );

            aggregate( symbol, records );
        } );

        totals( total );

        await transactions();
    };

    // day trades
    async function transactions()
    {
        // initialize
        let last = module.data.date.at( -1 );
        let date = self.date || last;
        let array = [];

        // process
        let records = module.data.all.filter( record => t2.formats.date( record.date ) == date );
            records.forEach( record => 
            {
                // add time to be able to orderBy datetime
                record.time = t2.formats.time( record.time );
                record.date = t2.common.addTime( record.date, record.time );

                array.push( record );
            } );
        
        // display
        let container = await t2.ui.addComponent( { id: "day", title: date, component: "container", parent: t2.ui.elements.get( "content" ), module: module } );

        let table = await t2.ui.addComponent( { id: "transactions", component: "table", parent: container.element, module: module } );
            table.handlers = { update: ( e, record ) => module.handlers.update( e, record ) }; 
            table.addColumn( { 
                input: { name: "id", type: "hidden" }, 
                cell: { css: {}, display: 0, modes: [ "edit" ] },
                format: [] } );
            table.addColumn( { 
                input: { name: "date", type: "text" }, 
                cell: { css: {}, display: 5, modes: [ "edit" ] },
                format: [ "date" ] } );
            table.addColumn( { 
                input: { name: "time", type: "text" }, 
                cell: { css: {}, display: 5, modes: [ "read", "edit" ] },
                format: [ "time" ] } );
            table.addColumn( { 
                input: { name: "symbol", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [ "uppercase" ],
                handler: async ( cell, record ) => 
                {
                    module.setSymbol( cell.textContent );
                    module.view = "transactions"
                    await module.refresh( record );
                } } );
            table.addColumn( { 
                input: { name: "action", type: "text" }, 
                cell: { css: { value: null }, display: 3, modes: [ "read", "edit" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "notes", type: "text" }, 
                cell: { css: { value: "action" }, display: 4, modes: [ "read", "edit" ] } } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 1 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read", "edit" ] } } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read", "edit" ] },
                format: [ "precision" ],
                formula: ( args ) => 
                {
                    args.totals[ args.column ] = 0; 

                    return args.value;
                } } );
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "brokerage", type: "text", value: "TDAmeritrade" }, 
                cell: { css: {}, display: 6, modes: [ "edit" ] },
                format: [] } );         
            table.addColumn( { 
                input: { type: "submit", value: "UPDATE" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "date" } );
            table.setTotals();
    }
};

export default Day;
