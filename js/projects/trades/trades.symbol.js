import { aggregate, reset, total } from "./trades.aggregate.js";
import totals from "./trades.totals.js";
import Data from "./trades.data.js";

const Symbol = function( module )
{
    this.init = async function()
    {
        let breadcrumbs = t2.ui.children.get( "footer.breadcrumbs" );
        
        let symbols = t2.ui.children.get( "menu.symbols" );
            symbols.show();

        let content = t2.ui.children.get( "content" );
            content.clear();

        let details = await content.addContainer( { id: "details", type: "panels", format: "vertical" } );
            // set breadcrumbs
            details.addListener( { type: "click", handler: ( active ) => breadcrumbs.set.path( 3, active.panel?.label || "" ) } );
            // add panels
            details.addPanel( { id: "history", label: "history", type: "panel" } );
            details.addPanel( { id: "match", label: "match", type: "panel" } );
            details.addPanel( { id: "short", label: "short", type: "panel" } );
            details.addPanel( { id: "charts", label: "charts", type: "panel" } );
        let panels = await details.render( "title", "tabs" );

        async function history( parent, data )
        {
            let array = data.filter( record => record.symbol == module.symbol );

            let table = await parent.addComponent( { id: "transactions", type: "table" } );
                table.addRowListener( { type: "contextmenu", handler: table.edit } );
                table.addSubmitListener( { type: "submit", handler: async function ( data )
                { 
                    let form = this;

                    let record = await t2.db.tx.update( module.table, Number( data.id ), new Data( data ) );

                    let records = await t2.db.tx.filter( module.table, [ { key: "symbol", operator: "==", value: module.symbol } ] );

                    form.parent.remove();

                    table.normal( record.id );
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
                    cell: { css: { value: null }, display: 3, modes: [ "read", "edit" ] },
                    format: [ "uppercase" ] } );
                table.addColumn( { 
                    input: { name: "notes", type: "text" }, 
                    cell: { css: { value: "action" }, display: 4, modes: [ "read", "edit" ] } } );
                table.addColumn( { 
                    input: { name: "qty", type: "number", step: 1 }, 
                    cell: { css: { class: "info" }, display: 3, modes: [ "read", "edit" ] },
                    format: [ "precision" ] } );
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
                    format: [ "negate", "precision" ] } );
                table.addColumn( { 
                    input: { name: "brokerage", type: "select", value: "TDAmeritrade" }, 
                    cell: { css: {}, display: 8, modes: [ "read", "edit" ] },
                    format: [],
                    options: [ "TDAmeritrade", "JPMorganChase", "Robinhood" ] } );         
                table.addColumn( { 
                    input: { type: "submit", value: "UPDATE" }, 
                    cell: { css: {}, display: 4, modes: [ "edit" ] },
                    format: [] } );
                table.setColumns( module.mode );
                table.populate( { array: array, orderBy: "datetime" } );
                table.setTotals();       
        }


        history( panels.get( "history" ), module.data.all );

        // tab configurations
        let array = Array.from( panels.keys() );
        let action = module.symbol ? "enable" : "disable";
        let activate = module.symbol ? array[ 0 ] : null;
        
        let tabs = details.children.get( "tabs" );
            tabs[ action ]( array );
            tabs.activate( activate );
    };
};

export default Symbol;