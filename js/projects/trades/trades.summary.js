const Summary = function( module )
{
    let self = this;
    let total = { open: 0, closed: 0 };
    
    this.init = async function()
    {
        await summary();
        await dividends();
    };

    // summary
    async function summary()
    {
        let array = [];

        module.data.symbol.forEach( symbol => 
        {
            let collection = module.data.all.filter( record => record.symbol == symbol );
            let aggregate = {};
                aggregate.id = symbol;
                aggregate.symbol = symbol;
                aggregate.trades = collection.length;
                aggregate.low = 0;
                aggregate.high = 0;
                aggregate.buy = collection.map( record => ( record.action == "BUY" ) ? record.qty : 0 ).reduce( ( a, b ) => a + b, 0 );
                aggregate.sell = collection.map( record => ( record.action == "SELL" ) ? record.qty : 0 ).reduce( ( a, b ) => a + b, 0 );
                aggregate.position = aggregate.buy - aggregate.sell;
                aggregate.gain = collection.map( record => record.qty * record.price * record.sign ).reduce( ( a, b ) => a + b, 0 );
                aggregate.price = aggregate.gain / aggregate.buy;

            total.open   += aggregate.position ? aggregate.gain : 0;
            total.closed += aggregate.position ? 0 : aggregate.gain;

            array.push( aggregate );
        } );

        // display
        let div = t2.common.el( "div", t2.ui.elements.get( "content" ) );
            div.classList.add( "hform" );

        let table = await t2.ui.addComponent( { id: "aggregates", component: "table", parent: div, module: module } );
            table.addColumn( { 
                input: { name: "symbol", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "trades", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "buy", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "sell", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "position", type: "number", step: 1, min: 0 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { predicate: { conditions: [ { name: "position", operator: "==", value: 0 }, { name: "gain", operator: "<", value: 0 } ], options: [ "sell", "value" ] } }, display: 4, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "gain", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) => 
                { 
                    if ( !args.record.position ) 
                    {
                        args.totals[ args.column ] += args.value;
                    }
                } } );
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "symbol" } );
            table.setTotals();
    }

    // dividends
    async function dividends()
    {
        let array = module.data.all.filter( record => ( record.notes == "DIV") );

        let div = t2.common.el( "div", t2.ui.elements.get( "content" ) );
            div.classList.add( "hform" );

        let table = await t2.ui.addComponent( { id: "dividends", component: "table", parent: div, module: module } );
            table.addColumn( { 
                input: { name: "notes", type: "text" }, 
                cell: { css: { value: "action" }, display: 4, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "symbol", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 1, min: 0 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { predicate: { conditions: [ { name: "position", operator: "==", value: 0 }, { name: "gain", operator: "<", value: 0 } ], options: [ "sell", "value" ] } }, display: 4, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "symbol" } );
            table.setTotals();
    };
};

export default Summary;