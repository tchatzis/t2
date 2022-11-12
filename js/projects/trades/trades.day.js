import Data from "./trades.data.js";
import tooltip from "./trades.tooltip.js";

const Day = function( module )
{
    let self = this;
    let table;
    let today = t2.formats.isoDate( new Date() );
    let content = t2.ui.children.get( "content" );
    let margin = t2.ui.children.get( "margin" );

    this.run = async function()
    {
        Object.assign( module, this );

        await this.refresh();  
    };

    this.refresh = async function()
    {
        module.date = module.date || today;

        await module.queries(); 
        await layout();   
    };

    async function layout()
    {
        await date();
        brokerages();
        await week();
        await module.transaction();
    }

    async function date()
    {
        let submenu = t2.ui.children.get( "submenu" );
            submenu.clear();

        let dates = await submenu.addComponent( { id: "date", type: "form", format: "flex" } );
            dates.addListener( { type: "submit", handler: async ( data ) => module.setDate( data.date ) } );
            dates.addField( { 
                input: { name: "date", type: "date", value: module.date, max: today, required: "" }, 
                cell: { css: {}, display: 7 },
                format: [ "date" ] } );
            dates.addField( { 
                input: { type: "submit", value: "SET" }, 
                cell: { css: {}, display: 3 },
                format: [] } )
    }

    function brokerages()
    {
        module.data.brokerage.forEach( async ( brokerage ) =>
        {
            let array = module.data.filtered.filter( record => ( t2.formats.isoDate( record.datetime ) == module.date ) && record.brokerage == brokerage );

            await transactions( array, brokerage );
        } );
    }

    async function transactions( array, brokerage )
    {
        let container = await content.addContainer( { id: brokerage.toLowerCase(), type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `${ brokerage } \u00BB ${ module.date }` );

        let table = await container.addComponent( { id: brokerage.toLowerCase(), type: "table" } );
            table.addRowListener( { type: "contextmenu", handler: table.edit } );
            table.addSubmitListener( { type: "submit", handler: async function ( data )
            { 
                let form = this;

                let record = await t2.db.tx.update( module.table, Number( data.id ), new Data( data ) );

                let records = await t2.db.tx.filter( module.table, [ { key: "brokerage", operator: "==", value: brokerage }, { key: "datetime", operator: "==", value: module.date } ] );

                table.populate( { array: records.data, orderBy: "datetime" } );
                table.highlight( data.id );
                table.setTotals();

                let message = await container.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                    message.set( `Updated ${ data.id }` );   

                let popup = t2.ui.children.get( "subcontent.popup" );
                    popup.element?.remove();
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
                input: { name: "qty", type: "number", step: 0.0001 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read", "edit" ] },
                format: [ "precision" ],
                formula: ( args ) =>
                {
                    let value = args.record[ args.column ] * -args.record.sign;
                    
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
                format: [ "precision" ],
                formula: ( args ) =>
                {
                    let value = args.record[ args.column ] * args.record.sign;
                    
                    args.totals[ args.column ] += value;

                    return value;
                } } );
            table.addColumn( { 
                input: { name: "brokerage", type: "select", value: brokerage }, 
                cell: { css: {}, display: 8, modes: [ "edit" ] },
                format: [],
                options: [ "TDAmeritrade", "JPMorganChase", "Robinhood" ] } );         
            table.addColumn( { 
                input: { type: "submit", value: "UPDATE" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "datetime" } );
            table.setTotals();

        module[ brokerage ] = table;
    };

    async function week()
    {
        let container = await margin.addContainer( { id: "week", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Week at a Glance` );
        
        let qty = { predicate: { conditions: [ { name: "qty", operator: ">=", value: 0 } ], options: [ "buy", "sell" ] } };
        let week = await container.addComponent( { id: "week", type: "week", format: "table-body" } );
            week.populate(
            { 
                data: module.data.all, 
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
};

export default Day;
