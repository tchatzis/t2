import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module, array, source )
{   
    let self = this;
        self.array = array;
    let panel;
    let previous = { cell: null, popup: null };

    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "box", format: "flex", css: [ "panel" ] } );
 
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
            //{ id: "submenu", functions: [ { ignore: "clear" }, { clear: null } ] }, 
            //{ id: "subcontent", functions: [ { ignore: "clear" } ] },
            //{ id: "submargin", functions: [ { ignore: "clear" }, { clear: null } ] },
            { id: "menu", functions: [ { ignore: "clear" } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    } 

    // content
    async function output()
    {
        await zero.call( this );
        await brokerages.call( this );
        await week.call( this );
        await chart.call( this );
    }

    // transactions data
    async function brokerages()
    {
        let promises = [];
        
        module.data.brokerage.forEach( async ( brokerage ) => 
        {
            let array = module.data.filtered.filter( record => ( t2.formats.isoDate( record.datetime ) == module.date ) && record.brokerage == brokerage );

            promises.push( await transactions.call( this, array, brokerage ) );
        } );

        await Promise.all( promises );
    }

    // charted balances of transactions
    async function chart()
    {
        let container = await this.addContainer( { id: "values", type: "box", format: "block", css: [ "container" ] } );
            container.scale();
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Transactions \u00BB ${ module.date }` );

        let chart = await container.addComponent( { id: "symbols", type: "chart", format: "flex" } );
            chart.addLayer( { color: "hsl( 180, 70%, 30% )", font: "12px sans-serif", type: "bar",
                data: self.array,
                axes:
                { 
                    "0": { axis: "symbol", settings: { mod: ( p ) => !( p % 1 ), axis: true, format: "uppercase", step: 1, colored: { axis: true, data: true } } },
                    "1": { axis: "value", settings: { mod: ( p ) => !( p % 10 ), axis: true } } 
                } } );
    }

    // week cell popup
    async function records( td, key, column, array )
    {
        if ( !array )
            return;

        let submargin = t2.ui.children.get( "submargin" );
        
        let popop = await submargin.addContainer( { id: "popop", type: "popup", format: "block" } );
            popop.reset();
            popop.setExit( () => td.classList.remove( "highlight" ) );

        let container = await popop.addContainer( { id: "edit", type: "box", format: "block" } );
            container.element.style.position = "relative";
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `${ key } \u00BB ${ column }` );  

        let table = await container.addComponent( { id: "records", type: "table" } );
            table.addColumn( { 
                input: { name: "datetime", type: "datetime" }, 
                cell: { css: { class: "date" }, display: 12, modes: [ "read" ] },
                format: [ "date&time" ] } );
            table.addColumn( { 
                input: { name: "symbol", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "action", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } )
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 0.0001 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read" ] },
                format: [ "auto" ],
                formula: ( args ) =>
                {
                    let value = args.record[ args.column ] * -args.record.sign;
                    
                    args.totals[ args.column ] += value;

                    return value;
                } } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.0001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) => 
                {
                    args.totals[ args.column ] = 0; 

                    return args.value;
                } } ); 
            table.addColumn( { 
                input: { name: "value", type: "number", step: 0.0001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) =>
                {
                    let value = args.record[ args.column ] * args.record.sign;
                    
                    args.totals[ args.column ] += value;

                    return value;
                } } ); 
            table.populate( { array: array, orderBy: "datetime" } );
            table.setTotals();

        previous.cell?.classList.remove( "highlight" );
        previous.popup?.remove();

        previous.cell = td;
        previous.popup = popup;
    }

    // date's transactions table
    async function transactions( array, brokerage )
    {
        let container = await this.addContainer( { id: brokerage.toLowerCase(), type: "box", format: "block", css: [ "container" ] } );
            container.scale( 1 );
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `${ brokerage } \u00BB ${ module.date }` );

        let table = await container.addComponent( { id: brokerage.toLowerCase(), type: "table" } );
            table.addRowListener( { type: "contextmenu", handler: table.edit } );
            table.addSubmitListener( { type: "submit", handler: async ( args ) => 
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
                cell: { css: { value: null }, display: 3, modes: [ "read", "edit" ] },
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
                format: [ "dollar" ],
                formula: ( args ) =>
                {
                    let value = args.record[ args.column ] * args.record.sign;
                    
                    args.totals[ args.column ] += value;

                    return value;
                } } );
            table.addColumn( { 
                input: { name: "brokerage", type: "select", value: brokerage }, 
                cell: { css: {}, display: 9, modes: [ "edit" ] },
                format: [],
                options: [ "TDAmeritrade", "JPMorganChase", "Robinhood" ] } );         
            table.addColumn( { 
                input: { type: "submit", value: "UPDATE" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            table.populate( { array: array, orderBy: "datetime", dir: "desc" } );
            table.setTotals();

        source[ brokerage ] = table;
    };

    // this week at a glance component
    async function week()
    {
        let container = await this.addContainer( { id: "week", type: "box", format: "block", css: [ "container" ] } );
            container.scale();
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Week at a Glance` );
        
        let qty = { predicate: { conditions: [ { name: "qty", operator: ">=", value: 0 } ], options: [ "buy", "sell" ] } };
        let week = await container.addComponent( { id: "week", type: "weekdays", format: "table-body" } );
            week.addCellListener( { type: "contextmenu", handler: records } );
            week.populate(
            { 
                data: module.data.all, 
                date: module.date ? new Date( module.date ) : new Date(),
                primaryKey: "id",
                column: { name: "datetime" },
                row: { name: "symbol", array: module.data.symbol },
                cell: { 
                    input: { name: "qty", type: "number" }, 
                    cell: { css: qty, display: 4, modes: [ "read" ] }, //, value: tooltip 
                    format: [ "negate", "auto" ] 
                }
            } );
    }

    // show errant transactions
    async function zero()
    {
        let array = module.data.all.filter( record => !record.qty || !record.price );

        let container = await this.addContainer( { id: "zero", type: "box", format: "inline-block", css: [ "container" ] } );
            container.scale();
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( "Zero Entries" );

        let table = await container.addComponent( { id: "zero", type: "table" } );
            table.addRowListener( { type: "contextmenu", handler: table.edit } );
            table.addSubmitListener( { type: "submit", handler: ( args ) => 
            {
                args.source = self;

                module.updateTransaction( args );
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
                cell: { css: { value: "action" }, display: 4, modes: [ "edit" ] } } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 0.0001 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read", "edit" ] },
                format: [ "auto" ] } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.0001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read", "edit" ] },
                format: [ "dollar" ] } );
            table.addColumn( { 
                input: { name: "brokerage", type: "select" }, 
                cell: { css: {}, display: 9, modes: [ "edit" ] },
                format: [],
                options: [ "TDAmeritrade", "JPMorganChase", "Robinhood" ] } );         
            table.addColumn( { 
                input: { type: "submit", value: "UPDATE" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            table.populate( { array: array, orderBy: "datetime" } );        
    }
};

export default Panel;