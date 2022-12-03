import Common from "../../t2/t2.common.handlers.js";
import Data from "./trades.data.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let sum = ( a, b ) => a + b;

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
        await output();   
    };    

    async function output()
    {
        let array = module.data.filtered.filter( record => ( record.action == "DIV") );

        let table = await panel.addComponent( { id: "dividends", type: "table" } );
            table.addRowListener( { type: "contextmenu", handler: table.edit } );
            table.addSubmitListener( { type: "submit", handler: async function ( data )
            { 
                let form = this;

                table.highlight( data.id );

                let record = await t2.db.tx.update( module.table, Number( data.id ), new Data( data ) );

                let records = await t2.db.tx.filter( module.table, [ { key: "action", operator: "==", value: "DIV" } ] );

                table.populate( { array: records.data, orderBy: "symbol" } );
                table.setTotals();

                let message = await panel.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                    message.set( `Updated ${ data.id }` );   

                let popup = t2.ui.children.get( "subcontent.popup" );
                    popup?.element?.remove();

                table.normal( data.id );
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
                format: [ "negate", "precision" ],
                formula: ( args ) => args.value * -1 } );
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "negate", "precision" ], 
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

export default Panel;