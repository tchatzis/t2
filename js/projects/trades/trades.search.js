const Template = function( module )
{
    let self = this;
    let table;

    this.init = async function()
    {
        await this.refresh(); 

        await navigation();  
    };

    this.refresh = async function()
    {
        module.unsetSymbol();
        module.unsetDate();

        await module.queries();
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "submenu",    functions: [ { clear: null }, { hide: null } ] },
            { id: "subcontent", functions: [ { clear: null }, { hide: null } ] },
            { id: "submargin",  functions: [ { clear: null }, { hide: null } ] },
            { id: "menu",       functions: [ { ignore: "clear" }, { hide: null } ] },
            { id: "content",    functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin",     functions: [ { clear: null }, { show: null }, { invoke: [ { f: filters, args: null } ] } ] } 
        ] );
    }

    async function filters()
    {
        let today = new Date();
        let max = t2.formats.isoDate( today.setDate( today.getDate() + 1 ) );
        let all = module.data.all.map( record => new Date( record.datetime ) );
        let min = t2.formats.isoDate( Math.min.apply( null, all ) );

        let form = await this.addComponent( { id: "range", type: "form", format: "block" } );
            form.addListener( { type: "submit", handler: handler } );
            form.addField( { 
                input: { name: "from", label: "from", type: "date", value: min, min: min, max: max, required: "" }, 
                cell: { css: {}, display: 8 },
                format: [ "date" ] } );
            form.addField( { 
                input: { name: "to", label: "to", type: "date", value: max, min: min, max: max, required: "" }, 
                cell: { css: {}, display: 8 },
                format: [ "date" ] } );
            form.addField( { 
                input: { name: "symbol", label: "symbol", type: "select" }, 
                cell: { css: {}, display: 8 },
                format: [ "uppercase" ],
                options: [ "", ...module.data.symbol ] } );
            form.addField( { 
                input: { name: "brokerage", label: "brokerage", type: "select" }, 
                cell: { css: {}, display: 8 },
                format: [ "uppercase" ],
                options: [ "", ...module.data.brokerage ] } );
            form.addField( { 
                input: { name: "qty", label: "quantity", type: "number", min: 0, step: 0.0001 }, 
                cell: { css: {}, display: 4 },
                format: [] } );
            form.addField( { 
                input: { name: "price", label: "price", type: "number", min: 0, step: 0.0001 }, 
                cell: { css: {}, display: 5 },
                format: [] } );
            form.addField( { 
                input: { name: "notes", label: "notes", type: "select" }, 
                cell: { css: {}, display: 6 },
                format: [ "uppercase" ],
                options: [ "", "SHORT", "COVER", "PARTIAL" ] } );
            form.addField( { 
                input: { name: "action", label: "action", type: "select" }, 
                cell: { css: {}, display: 4 },
                format: [ "uppercase" ],
                options: [ "", ...module.data.actions ] } );
            form.addField( { 
                input: { type: "submit", value: "FILTER" }, 
                cell: { css: {}, display: 4 },
                format: [] } );
    };

    async function output()
    {  
        table = await this.addComponent( { id: "transactions", type: "table" } );
        table.addRowListener( { type: "contextmenu", handler: table.edit } );
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
            format: [ "precision" ],
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
    }

    function handler()
    {
        let filters = arguments[ 0 ].data;
        let result = [ ...module.data.all ];

        Object.keys( filters ).forEach( filter => 
        {
            if ( filters[ filter ] !== "" )
            {
                switch ( filter )
                {
                    case "from":
                        result = [ ...result ].filter( record => new Date( record.datetime ) >= new Date( filters[ filter ] ) );
                    break;

                    case "to":
                        result = [ ...result ].filter( record => new Date( record.datetime ) < new Date( filters[ filter ] ) );
                    break;

                    case "qty":
                    case "price": 
                            result = [ ...result ].filter( record => Number( record[ filter ] ) === Number( filters[ filter ] ) );
                    break;

                    default:
                        result = [ ...result ].filter( record => record[ filter ] == filters[ filter ] );
                    break;
                };
            }
        } );

        //console.log( filters, result );

        module.symbol = result.symbol;

        //result.length ? this.show() : this.hide()

        table.populate( { array: result, orderBy: "datetime" } );
        table.setTotals();
    }
};

export default Template;