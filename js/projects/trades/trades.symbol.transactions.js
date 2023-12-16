import Common from "../../t2/t2.container.handlers.js";
import tooltip from "./trades.tooltip.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let table;
    let sort = ( a, b ) => new Date( a.datetime ) - new Date( b.datetime );
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: params.id, type: "box", format: "flex", css: [ "panel" ] } );
 
        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );
    };

    this.refresh = async function()
    {
        await module.queries(); 

        await navigation();
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "submenu", functions: [ { ignore: "clear" } ] }, 
            { id: "subcontent", functions: [ { ignore: "clear" } ] },
            { id: "submargin", functions: [ { ignore: "clear" } ] },
            { id: "menu", functions: [ { ignore: "clear" } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: transactions, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    }

    async function transactions()
    {  
        let records = module.data.filtered.sort( sort );

        table = await this.addComponent( { id: "transactions", type: "table" } );
        table.addRowListener( { type: "contextmenu", handler: table.edit } );
        table.addRowListener( { type: "click", handler: ( args ) => 
        { 
            args.row.classList.toggle( "pairing" ); 
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
            cell: { css: { value: "brokerage" }, display: 4, modes: [ "read", "edit" ] },
            format: [ "uppercase" ],
            options: module.data.symbol } );
        table.addColumn( { 
            input: { name: "action", type: "text" }, 
            cell: { css: { value: "action" }, display: 3, modes: [ "read", "edit" ] },
            format: [ "uppercase" ] } );
        table.addColumn( { 
            input: { name: "notes", type: "text" }, 
            cell: { css: { value: "action" }, display: 4, modes: [ "read", "edit" ] } } );
        table.addColumn( { 
            input: { name: "qty", type: "number", step: 0.0001 }, 
            cell: { css: { class: "info" }, display: 3, modes: [ "read", "edit" ] },
            format: [ "auto" ],
            formula: ( args ) =>
            {
                let value = args.record[ args.column ];// * -args.record.sign

                args.totals[ args.column ] += value;

                return value;
            } } );
        table.addColumn( { 
            input: { name: "price", type: "number", step: 0.0001 }, 
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
            format: [ "dollar" ],
            formula: ( args ) =>
            {
                let value = args.record[ args.column ];// * args.record.sign
                
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
        table.populate( { array: records, orderBy: "datetime", dir: "desc" } );
        table.setTotals();
    }
};

export default Panel;