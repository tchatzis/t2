import Common from "../../t2/t2.common.handlers.js";
import Data from "./trades.data.js";
import tooltip from "./trades.tooltip.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let table;
    let subcontent;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );
        subcontent = t2.ui.children.get( "subcontent" );
 
        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );
    };

    this.run = async function()
    {
        subcontent.clear();
        panel.clear();
        
        await week();   
        await history();     
        await module.transaction();  
    };

    async function history()
    {  
        let records = module.data.filtered;
        
        table = await panel.addComponent( { id: "transactions", type: "table" } );
        table.addRowListener( { type: "contextmenu", handler: table.edit } );
        table.addRowListener( { type: "click", handler: ( data, config, row ) => 
        { 
            row.classList.toggle( "pairing" ); 
        } } );
        table.addSubmitListener( { type: "submit", handler: async function ( args )
        { 
            args.source = self;

            await module.updateTransaction( args );
        } } );
        table.addColumn( { 
            input: { name: "id", type: "hidden" }, 
            cell: { css: {}, display: 0, modes: [ "edit" ] },
            format: [] } );
        table.addColumn( { 
            input: { name: "datetime", type: "datetime" }, 
            cell: { css: { class: "date" }, display: 12, modes: [ "read", "edit" ] },
            format: [ "date&time" ] } );
        table.addColumn( { 
            input: { name: "symbol", type: "select" }, 
            cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
            format: [ "uppercase" ],
            options: module.data.symbol } );
        table.addColumn( { 
            input: { name: "action", type: "text" }, 
            cell: { css: { value: "brokerage" }, display: 3, modes: [ "read", "edit" ] },
            format: [ "uppercase" ] } );
        table.addColumn( { 
            input: { name: "notes", type: "text" }, 
            cell: { css: { value: "action" }, display: 4, modes: [ "read", "edit" ] } } );
        table.addColumn( { 
            input: { name: "qty", type: "number", step: 1 }, 
            cell: { css: { class: "info" }, display: 3, modes: [ "read", "edit" ] },
            format: [ "auto" ],
            formula: ( args ) =>
            {
                let value = args.record[ args.column ] * -args.record.sign;
                
                args.totals[ args.column ] += value;

                return value;
            } } );
        table.addColumn( { 
            input: { name: "price", type: "number", step: 0.001 }, 
            cell: { css: { class: "value" }, display: 4, modes: [ "read", "edit" ] },
            format: [ "dollar" ],
            formula: ( args ) => 
            {
                args.totals[ args.column ] = 0; 

                return args.value;
            } } );
        table.addColumn( { 
            input: { name: "value", type: "number", readonly: "" }, 
            cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
            format: [ "dollar" ],
            formula: ( args ) =>
            {
                let value = args.record[ args.column ] * args.record.sign;
                
                args.totals[ args.column ] += value;

                return value;
            } } );
        table.addColumn( { 
            input: { name: "brokerage", type: "select" }, 
            cell: { css: {}, display: 9, modes: [ "edit" ] },
            format: [],
            options: [ "TDAmeritrade", "JPMorganChase", "Robinhood" ] } );         
        table.addColumn( { 
            input: { type: "submit", value: "UPDATE" }, 
            cell: { css: {}, display: 4, modes: [ "edit" ] },
            format: [] } );
        table.populate( { array: records, orderBy: "datetime" } );
        table.setTotals();
    }

    async function week()
    {
        let qty = { predicate: { conditions: [ { name: "qty", operator: ">=", value: 0 } ], options: [ "buy", "sell" ] } };
        let week = await panel.addComponent( { id: "week", type: "weekdays", format: "table-body" } );
            week.populate(
            { 
                data: module.data.filtered, 
                date: module.date ? new Date( module.date) : new Date(),
                primaryKey: "id",
                column: { name: "datetime" },
                row: { name: "symbol", array: module.data.symbol },
                cell: { 
                    input: { name: "qty", type: "number" }, 
                    cell: { css: qty, display: 4, modes: [ "read" ], value: tooltip },
                    format: [ "negate", "number" ] 
                }
            } );
    }

    /*async function handler( data )
    {
        let event = this;
        let submit = event.submitter;
            submit.setAttribute( "disabled", "" );

        data.action = submit.value;

        let record = await t2.db.tx.create( module.table, new Data( data ) );

        let records = await t2.db.tx.filter( module.table, [ { key: "symbol", operator: "==", value: record.data.symbol } ] );

        submit.removeAttribute( "disabled" );

        table.populate( { array: records.data } );
        table.highlight( record.data.id );
        table.setTotals();

        self.run();
    }*/
};

export default Panel;