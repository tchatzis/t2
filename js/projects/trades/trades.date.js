const Tabs = function( module )
{
    let self = this;
        self.positions = [];
    let max = Math.max.apply( null, module.data.all.map( record => new Date( record.datetime ) ) );
    let sum = ( a, b ) => a + b;
    let array = [];
    let balance = [];
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

        array = preamble();
        balance = await balances();        

        await module.queries();
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "submenu",    functions: [ { ignore: "clear" }, { clear: null }, { show: null }, { invoke: [ { f: date, args: null } ] } ] },
            { id: "submargin",  functions: [ { ignore: "clear" }, { clear: null }, { show: null } ] }, 
            { id: "subcontent", functions: [ { ignore: "clear" }, { clear: null }, { show: null }, { invoke: [ { f: module.transaction, args: self } ] } ] },
            { id: "menu",       functions: [ { clear: null }, { show: null }, { invoke: [ { f: symbols, args: null } ] } ] },
            { id: "content",    functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin",     functions: [ { clear: null }, { invoke: [ { f: summary, args: null } ] } ] }
        ] );
    }

    // menu
    async function symbols()
    {
        let symbols = await this.addComponent( { id: "symbols", type: "menu", format: "block" } );
            symbols.update( self.symbols );
            symbols.addListener( { type: "click", handler: async function() 
            { 
                let symbol = symbols.activated.toUpperCase();
                
                module.setSymbol( symbol );

                await t2.navigation.path( `/symbol/${ symbol }` );
            } } );   

        if ( module.symbol )
            symbols.activate( module.symbol );
    }

    // submenu
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

    // content
    async function output()
    {
        let panels = await this.addComponent( { id: "panels", type: "panels", format: "block", output: "vertical" } );
            await panels.add( "Module", { id: "transactions", label: "transactions", format: "block", config: { arguments: [ module, array, self ], src: "../projects/trades/trades.date.transactions.js" } } );
            await panels.add( "Module", { id: "snapshot", label: "snapshot", format: "block", config: { arguments: [ module, balance ], src: "../projects/trades/trades.date.snapshot.js" } } );
            await panels.add( "Module", { id: "balances", label: "balances", format: "block", config: { arguments: [ module, balance ], src: "../projects/trades/trades.date.balances.js" } } );
            await panels.add( "Module", { id: "open", label: "open", format: "block", config: { arguments: [ module, array, self.symbols ], src: "../projects/trades/trades.date.open.js" } } );
            await panels.add( "Module", { id: "details", label: "details", format: "block", config: { arguments: [ module, array, self.symbols ], src: "../projects/trades/trades.date.details.js" } } );
            await panels.add( "Module", { id: "revisit", label: "revisit", format: "block", config: { arguments: [ module, array, self.symbols ], src: "../projects/trades/trades.date.revisit.js" } } );
            await panels.add( "Module", { id: "gains", label: "gains", format: "block", config: { arguments: [ module, self.gains ], src: "../projects/trades/trades.date.gains.js" } } );
            await panels.add( "Module", { id: "losses", label: "losses", format: "block", config: { arguments: [ module, self.losses ], src: "../projects/trades/trades.date.losses.js" } } );
            await panels.add( "Module", { id: "pending", label: "pending", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.date.pending.js" } } );
            
            panels.setControls( 
            { 
                breadcrumbs: { index: 2, component: t2.navigation.components.breadcrumbs },
                controller: { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" }
            } );
    }

    // margin
    async function summary()
    {
        let matrix = await this.addComponent( { id: "matrix", type: "matrix", format: "table-body" } );
            matrix.addRow( { 
                input: { name: "transactions", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "auto", "number" ] } );
            matrix.addRow( { 
                input: { name: "change", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "auto", "number" ] } );         
            matrix.populate(
            { 
                data: self.summary, 
                primaryKey: "id",
                column: { name: "details" },
                row: { name: "data" }
            } );
    }

    // balances data
    async function balances()
    {
        let balances = await t2.db.tx.retrieve( "deposits" );
        let deposits = balances.data.filter( record => record.action == "DEP" );
        let interest = balances.data.filter( record => record.action == "INT" );

        let transactions = module.data.all;

        self.gains = [];
        self.gains.push( { name: "\u25f9", value: 0 } );

        self.losses = [];
        self.losses.push( { name: "\u25f9", value: 0 } );

        let object = {};
            object.cost = [];
            object.closed = [];
            object.deposits = deposits.map( record => Number( record.amount ) );
            object.interest = interest.map( record => -Number( record.amount ) );

        let dividends = transactions.filter( record => record.action == "DIV" );
            object.dividends = dividends.map( record => record.value );
            object.invested = [ ...object.deposits ];//, ...object.dividends
            object.margin = [ ...object.invested, ...object.interest ];

        module.data.symbol.forEach( symbol => 
        {
            let set = transactions.filter( record => record.symbol == symbol ).filter( record => record.action !== "DIV" );

            let div = dividends.filter( record => record.symbol == symbol );
            let divs = round( div.map( record => record.qty * record.sign ).reduce( sum, 0 ) );

            let data = {};
                data.symbol = symbol;
                data.qty = round( set.map( record => record.qty * record.sign ).reduce( sum, 0 ) ) - divs;
                data.value = set.map( record => record.value * record.sign ).reduce( sum, 0 );

            if ( data.qty )
            {
                object.cost.push( data.value );
                open( symbol, set )
            }
            else
            {
                object.closed.push( data.value );

                if ( data.value < 0 )
                    self.losses.push( { name: symbol, qty: data.qty, spread: 0, trade: 0, value: data.value } );
                else
                    self.gains.push( { name: symbol, qty: data.qty, spread: 0, trade: 0, value: data.value } );
            }

            object.margin.push( data.value );
        } );

        object.value = [ ...object.invested, ...object.interest, ...object.closed ];

        let array = [];
            array.push( { name: "\u25f9", value: 0 } );

        [ "deposits", "interest", "cost", "closed", "dividends", "margin", "value" ].forEach( name => array.push( { name: name, value: object[ name ].reduce( sum, 0 ) } ) ); //"invested", 

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

        self.positions.push( { symbol: symbol, data: { cost: split.SELL.value - split.BUY.value, dividend: split.DIV.value, qty: qty, trade: trade, estimated: value } } );

        return value;
    }

    // data
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
        self.summary = []

        symbols.forEach( symbol => 
        {
            let set = todays.filter( record => record.symbol == symbol );

            let data = {};
                data.transactions = set.length;
                data.symbol = symbol;
                data.qty = set.map( record => record.qty * -record.sign ).reduce( sum, 0 );
                data.value = set.map( record => record.value * record.sign ).reduce( sum, 0 );

            total += data.value;
            
            array.push( data );
        } );

        self.summary.push( { label: "details", data: { transactions: todays.length, change: total } } );

        array.push( { symbol: "TOTAL", qty: 0, value: total } )
        array.push( { symbol: "\u25fa", qty: 0, value: 0 } );

        return array;
    }
};

export default Tabs;