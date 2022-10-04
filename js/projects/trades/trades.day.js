import { aggregate, reset, total } from "./trades.aggregate.js";
import totals from "./trades.totals.js";
import Data from "./trades.data.js";

const Day = function( module )
{
    let self = this;
    let breadcrumbs;

    this.clear = () => t2.common.clear( [ "content", "submenu" ] );

    this.init = async function()
    {
        reset();
        self.clear();

        let max = Math.max.apply( null, module.data.all.map( record => new Date( record.datetime ) ) );
        let date = t2.formats.isoDate( new Date( max ) );

        let footer = t2.ui.elements.get( "footer" );
        breadcrumbs = await footer.children.get( "breadcrumbs" );
        
        let submenu = t2.ui.elements.get( "submenu" );

        let dates = await submenu.addComponent( { id: "date", type: "form", format: "flex" } );
            dates.addListener( { type: "submit", handler: async ( data ) => this.setDate( data ) } );
            dates.addField( { 
                input: { name: "date", type: "date", value: date, max: date, required: "" }, 
                cell: { css: {}, display: 7 },
                format: [ "date" ] } );
            dates.addField( { 
                input: { type: "submit", value: "SET" }, 
                cell: { css: {}, display: 4 },
                format: [] } ); 

        let data = {};
            data.date = date;

        this.setDate( data );
    };

    this.setDate = function( data )
    {
        self.date = data.date;
        
        breadcrumbs.set.path( 2, data.date );

        filter();
        display();
    };

    function display()
    {
        module.data.symbol.forEach( symbol => 
        {
            let records = module.data.all.filter( record => record.symbol == symbol && t2.formats.isoDate( record.datetime ) == self.date );

            aggregate( symbol, records );
        } );

        totals( total );
    }

    function filter()
    {
        t2.common.clear( [ "content" ] );

        [ "TDAmeritrade", "JPMorganChase", "Robinhood" ].forEach( async ( brokerage ) =>
        {
            let array = module.data.all.filter( record => ( t2.formats.isoDate( record.datetime ) == self.date ) && record.brokerage == brokerage );

            await transactions( array, brokerage );
        } );
    }

    // day trades
    async function transactions( array, brokerage )
    {
        let content = t2.ui.elements.get( "content" );
        let container = await content.addContainer( { id: "day", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "text" } );
            title.set( `${ brokerage } \u00BB ${ self.date }` );

        let table = await container.addComponent( { id: "transactions", type: "table" } );
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
                format: [] } );
            table.addColumn( { 
                input: { name: "datetime", type: "datetime" }, 
                cell: { css: { class: "date" }, display: 12, modes: [ "read", "edit" ] },
                format: [ "date&time" ] } );
            table.addColumn( { 
                input: { name: "symbol", type: "select" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [ "uppercase" ],
                options: module.data.symbol
                /*handler: async ( cell, record ) => 
                {
                    module.setSymbol( cell.textContent );
                    module.view = "edit"
                    await module.refresh( record );
                }*/ } );
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
    };
};

export default Day;
