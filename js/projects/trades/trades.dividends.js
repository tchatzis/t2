import Data from "./trades.data.js";

const Dividends = function( module )
{
    let self = this;
    
    this.run = async function()
    {
        Object.assign( module, this );

        await this.refresh();  
    };

    this.refresh = async function()
    {
        delete module.date;
        await module.queries(); 
        await layout();
    };

    async function layout()
    {
        await dividends();
    }

    // dividends
    async function dividends()
    {
        let array = module.data.filtered.filter( record => ( record.action == "DIV") );

        let content = t2.ui.children.get( "content" );
            content.clear();
        let container = await content.addContainer( { id: "day", type: "box", format: "block" } );
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

export default Dividends;