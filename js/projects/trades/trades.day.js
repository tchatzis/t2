const Template = function( module )
{
    let self = this;
    let max = Math.max.apply( null, module.data.all.map( record => new Date( record.datetime ) ) );
    let sum = ( a, b ) => a + b;
    let previous = { cell: null, popup: null };
    const round = ( value, decimals ) => 
    {
        const precision = Math.pow( 10, decimals || 4 );
        
        return Math.round( value * precision ) / precision;
    };

    this.init = async function()
    {
        await this.refresh();

        await navigation();  
    };

    this.refresh = async function()
    {
        module.unsetSymbol();
        module.setDate( module.date || t2.formats.isoDate( max ) ); 

        await module.queries();
    };

    async function navigation()
    {
        self.array = await preamble();
        
        await t2.navigation.update( 
        [ 
            { id: "submenu",    functions: [ { ignore: "clear" }, { clear: null }, { show: null }, { invoke: [ { f: date, args: null } ] } ] }, 
            { id: "subcontent", functions: [ { ignore: "clear" }, { clear: null }, { show: null }, { invoke: [ { f: module.transaction, args: self } ] } ] },
            { id: "submargin",  functions: [ { ignore: "clear" }, { clear: null }, { show: null } ] },
            { id: "menu",       functions: [ { clear: null }, { show: null }, { invoke: [ { f: symbols, args: null } ] } ] },
            { id: "content",    functions: [ { clear: null }, { invoke: 
            [ 
                { f: chart, args: null },
                { f: brokerages, args: null },
                { f: balances, args: null },
                { f: gains, args: null },
                { f: winners, args: null },
                { f: losses, args: null },
                { f: problems, args: null },
                { f: week, args: null },
                { f: zero, args: null }
            ] } ] },
            { id: "margin", functions: [ { clear: null }, { show: null } ] }
        ] );
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

    // chart data
    function preamble()
    {
        let todays = module.data.all.filter( record => t2.formats.isoDate( record.datetime ) == module.date );
            todays.sort( ( a, b ) => a.datetime > b.datetime ? 1 : -1 );
        let map = new Map();
        let _symbols = todays.map( record => record.symbol );
            _symbols.sort();
            _symbols.forEach( symbol => map.set( symbol, symbol ) );
        let symbols = Array.from( map.values() );
        let array = [];
            array.push( { symbol: "\u25f9", qty: 0, value: 0 } );
        let total = 0;

        self.symbols = symbols;

        symbols.forEach( symbol => 
        {
            let set = todays.filter( record => record.symbol == symbol );

            let data = {};
                data.symbol = symbol;
                data.qty = set.map( record => record.qty * -record.sign ).reduce( sum, 0 );
                data.value = set.map( record => record.value * record.sign ).reduce( sum, 0 );

            total += data.value;
            
            array.push( data );
        } );

        array.push( { symbol: "TOTAL", qty: 0, value: total } )
        array.push( { symbol: "\u25fa", qty: 0, value: 0 } );

        return array;
    }

    // balances data
    async function find()
    {
        let deposits = await t2.db.tx.retrieve( "deposits" );

        let transactions = module.data.all;//.filter( record => record.action !== "DIV" );

        self.closed = [];
        self.closed.push( { name: "\u25f9", value: 0 } );

        self.gains = [];
        self.gains.push( { name: "\u25f9", value: 0 } );

        self.losses = [];
        self.losses.push( { name: "\u25f9", value: 0 } );

        let object = {};
            object.open = [];
            object.closed = [];
            object.deposits = deposits.data.map( record => Number( record.amount ) );
            object.dividends = module.data.all.filter( record => record.action == "DIV" ).map( record => record.value );
            object.cash = [ ...object.deposits, ...object.dividends ];

        module.data.symbol.forEach( symbol => 
        {
            let set = transactions.filter( record => record.symbol == symbol );

            let data = {};
                data.symbol = symbol;
                data.qty = round( set.map( record => record.qty * record.sign ).reduce( sum, 0 ) );
                data.value = set.map( record => record.value * record.sign ).reduce( sum, 0 );

            if ( data.qty )
            {
                object.open.push( data.value );
                open( symbol, set )
            }
            else
            {
                object.closed.push( data.value );
                self.closed.push( { name: symbol, value: data.value } );

                if ( data.value < 0 )
                    self.losses.push( { name: symbol, qty: data.qty, spread: 0, trade: 0, value: data.value } );
                else
                    self.gains.push( { name: symbol, qty: data.qty, spread: 0, trade: 0, value: data.value } );
            }

            object.cash.push( data.value );
        } );

        self.closed.push( { name: "\u25fa", value: 0 } );

        let array = [];
            array.push( { name: "\u25f9", value: 0 } );

        [ "deposits", "open", "closed", "dividends", "cash" ].forEach( name => array.push( { name: name, value: object[ name ].reduce( sum, 0 ) } ) );

        array.push( { name: "\u25fa", value: 0 } );

        return array;
    }

    // open positions
    function open( symbol, array )
    {
        let split = {};

        [ "BUY", "SELL", "DIV" ].forEach( action =>
        {
            let actions = array.filter( record => record.action == action );

            split[ action ] = { value: actions.map( record => record.value ).reduce( sum, 0 ), qty: actions.map( record => record.qty ).reduce( sum, 0 ) };
            split[ action ].average = split[ action ].qty ? split[ action ].value / split[ action ].qty : 0;
        } );

        let total   = split.SELL.value - split.BUY.value - split.DIV.value;
        let qty     = split.BUY.qty - split.SELL.qty + split.DIV.qty;
        let trade   = -total / qty;
        let spread  = split.BUY.average - trade;
        let value   = spread * qty;

        return value;
    }

    // output
    // symbols menu
    async function symbols()
    {
        let array = self.symbols;

        let symbols = await this.addComponent( { id: "symbols", type: "menu", format: "block" } );
            symbols.update( array );
            symbols.addListener( { type: "click", handler: async function() 
            { 
                let symbol = symbols.activated.toUpperCase();
                
                module.setSymbol( symbol );

                await t2.navigation.path( `/symbol/${ symbol }` );
            } } );   

        if ( module.symbol )
            symbols.activate( module.symbol );
    }

    // select date form
    async function date()
    {
        let dates = await this.addComponent( { id: "date", type: "form", format: "flex" } );
            dates.addListener( { type: "submit", handler: async ( args ) => 
            {
                //console.log( args );
                module.date = args.data.date;
                self.init();
            } } );
            dates.addField( { 
                input: { name: "date", type: "date", value: module.date, max: max, required: "" }, 
                cell: { css: {}, display: 7 },
                format: [ "date" ] } );
            dates.addField( { 
                input: { type: "submit", value: "SET" }, 
                cell: { css: {}, display: 3 },
                format: [] } )
    }
    
    // today's transactions chart
    async function chart()
    {
        let container = await this.addContainer( { id: "values", type: "box", format: "inline-block" } );
            container.scale( 0.5 );
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

    // today's transactions table
    async function transactions( array, brokerage )
    {
        let container = await this.addContainer( { id: brokerage.toLowerCase(), type: "box", format: "inline-block" } );
            container.scale();
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
                input: { name: "brokerage", type: "select", value: brokerage }, 
                cell: { css: {}, display: 9, modes: [ "edit" ] },
                format: [],
                options: [ "TDAmeritrade", "JPMorganChase", "Robinhood" ] } );         
            table.addColumn( { 
                input: { type: "submit", value: "UPDATE" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            table.populate( { array: array, orderBy: "datetime" } );
            table.setTotals();

        self[ brokerage ] = table;
    };

    // underperformers chart
    async function losses()
    {
        self.losses.push( { name: "\u25fa", value: 0 } );
        
        let array = self.losses;

        let container = await this.addContainer( { id: "losses", type: "box", format: "inline-block" } );
            container.scale();
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Closed Losses \u00BB ${ module.date }` );

        let chart = await container.addComponent( { id: "underperformers", type: "chart", format: "flex" } );
            chart.addLayer( { color: "hsl( 0, 70%, 30% )", font: "12px sans-serif", type: "bar",
                data: array,
                axes:
                { 
                    "0": { axis: "name", settings: { mod: ( p ) => !( p % 1 ), axis: true, format: "text", step: 1, colored: { axis: true, data: true } } },
                    "1": { axis: "value", settings: { mod: ( p ) => !( p % 10 ), axis: true } } 
                } } );
    }

    // winners chart
    async function gains()
    {
        self.gains.push( { name: "\u25fa", value: 0 } );
        
        let array = self.gains;

        let container = await this.addContainer( { id: "gains", type: "box", format: "inline-block" } );
            container.scale();
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Closed Gains \u00BB ${ module.date }` );

        let chart = await container.addComponent( { id: "underperformers", type: "chart", format: "flex" } );
            chart.addLayer( { color: "hsl( 0, 70%, 30% )", font: "12px sans-serif", type: "bar",
                data: array,
                axes:
                { 
                    "0": { axis: "name", settings: { mod: ( p ) => !( p % 1 ), axis: true, format: "text", step: 1, colored: { axis: true, data: true } } },
                    "1": { axis: "value", settings: { mod: ( p ) => !( p % 10 ), axis: true } } 
                } } );
    }

    // underperformers table
    async function problems()
    {
        let array = self.losses.filter( record => record.name.charCodeAt( 0 ) < 256 );

        let container = await this.addContainer( { id: "problems", type: "box", format: "inline-block" } );
            container.scale();
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Closed Losses \u00BB ${ module.date }` );

        let table = await container.addComponent( { id: "problematic", type: "table" } );
            table.addColumn( { 
                input: { name: "name", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } )
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) =>
                {
                    let value = args.record[ args.column ];
                    
                    args.totals[ args.column ] += value;

                    return value;
                } } );
            table.populate( { array: array, orderBy: "name" } );
            table.setTotals();
    }

    // winners table
    async function winners()
    {
        let array = self.gains.filter( record => record.name.charCodeAt( 0 ) < 256 );

        let container = await this.addContainer( { id: "problems", type: "box", format: "inline-block" } );
            container.scale();
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Closed Losses \u00BB ${ module.date }` );

        let table = await container.addComponent( { id: "problematic", type: "table" } );
            table.addColumn( { 
                input: { name: "name", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } )
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) =>
                {
                    let value = args.record[ args.column ];
                    
                    args.totals[ args.column ] += value;

                    return value;
                } } );
            table.populate( { array: array, orderBy: "name" } );
            table.setTotals();
    }

    // todays's balances
    async function balances()
    {
        let array = await find();

        let container = await this.addContainer( { id: "balances", type: "box", format: "inline-block" } );
            container.scale();
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Balances \u00BB ${ module.date }` );

        let chart = await container.addComponent( { id: "underperformers", type: "chart", format: "flex" } );
            chart.addLayer( { color: "hsl( 90, 70%, 30% )", font: "12px sans-serif", type: "bar",
                data: array,
                axes:
                { 
                    "0": { axis: "name", settings: { mod: ( p ) => !( p % 1 ), axis: true, format: "text", step: 1, colored: { axis: false, data: true } } },
                    "1": { axis: "value", settings: { mod: ( p ) => !( p % 10 ), axis: true } } 
                } } );
    }

    // this week at a glance component
    async function week()
    {
        let container = await this.addContainer( { id: "week", type: "box", format: "inline-block" } );
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

        let container = await this.addContainer( { id: "zero", type: "box", format: "inline-block" } );
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
};

export default Template;
