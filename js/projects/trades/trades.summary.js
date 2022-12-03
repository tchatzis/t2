import { aggregate, reset, total } from "./trades.aggregate.js";

const Summary = function( module )
{
    let self = this;
    let sum = ( a, b ) => a + b;
    
    this.run = async function()
    {
        Object.assign( module, this );

        await this.refresh();  
    };

    this.refresh = async function()
    {
        delete module.date;
        await module.queries(); 
        await layout( preamble() );
    };

    async function layout( array )
    {
        await summary( array );
        await plot();
    }

    function preamble()
    {
        let array = [];

        reset();

        module.data.symbol.forEach( symbol => 
        {
            let records = module.data.all.filter( record => record.symbol == symbol );

            array.push( aggregate( symbol, records ) );
        } );

        return array;
    }

    // summary
    async function summary( array )
    {
        let margin = t2.ui.children.get( "margin" );
            margin.clear();
        let container = await margin.addContainer( { id: "day", type: "box", format: "block" } );
        let title = await container.addComponent( { id: "title", type: "title", format:"block", output: "text" } );
            title.set( "Summary" );

        let qty = { predicate: { conditions: [ { name: "qty", operator: ">", value: 0 } ], options: [ "active", "inactive" ] } };      
        let average = { predicate: { conditions: [ { name: "qty", operator: "==", value: 0 }, { name: "average", operator: ">", value: 0 } ], options: [ "buy", "value" ] } };  
        let gain = { predicate: { conditions: [ { name: "qty", operator: "==", value: 0 }, { name: "gain", operator: "<=", value: 0 } ], options: [ "sell", "value" ] } };
        let dividend = { predicate: { conditions: [ { name: "dividend", operator: ">", value: 0 } ], options: [ "buy", "value" ] } }; 

        let table = await container.addComponent( { id: "aggregates", type: "table" } );  
            table.addColumn( { 
                input: { name: "symbol", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "trades", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "div", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "buy", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "sell", type: "number", step: 1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 1, min: 0 }, 
                cell: { css: qty, display: 3, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "average", type: "number", step: 0.001 }, 
                cell: { css: average, display: 4, modes: [ "read" ] },
                format: [ "precision" ],
                formula: ( args ) =>
                {
                    args.totals[ args.column ] = 0;

                    return args.value;
                } } );
            table.addColumn( { 
                input: { name: "gain", type: "number", readonly: "" }, 
                cell: { css: gain, display: 6, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) => 
                { 
                    if ( !args.record.qty ) 
                    {
                        args.totals[ args.column ] += args.value;
                    }

                    return args.value;
                } } );
            table.addColumn( { 
                input: { name: "dividend", type: "number", readonly: "" }, 
                cell: { css: dividend, display: 4, modes: [ "read" ] },
                format: [ "dollar" ] } );
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "symbol" } );
            table.setTotals();
            table.highlight( module.symbol );
    }

    async function plot()
    {
        let records = await t2.db.tx.retrieve( "deposits" );
        let deposits = records.data;
        let previous = { date: null, amount: null };

        // filter by symbol and no dividends
        let array = module.data.all;
            array.sort( ( a, b ) => a.date < b.date ? 1 : -1 );

        // format and calculate data
        let day = 1000 * 60 * 60 * 24;

        // sort by date desc
        let total = {};
            total.DIV =  { qty: 0, value: 0, average: 0 };
            total.BUY =  { qty: 0, value: 0, average: 0 };
            total.SELL = { qty: 0, value: 0, average: 0 };
            total.SUB = { deposits: 0 };

        array.sort( ( a, b ) => a.datetime > b.datetime ? 1 : -1 );
        array.forEach( record => 
        { 
            record.date = Math.round( new Date( record.datetime ).getTime() * day ) / day;

            let date = t2.formats.isoDate( record.date );

            if ( date !== previous.date )
            {
                let amount = deposits.filter( deposit => t2.formats.isoDate( new Date( deposit.datetime ) ) == date ).map( d => Number( d.amount ) ).reduce( sum, 0 );
                
                total.SUB.deposits += amount;

                if ( previous.amount !== amount )
                    record.deposits = total.SUB.deposits;

                previous.amount = amount;
            }
            
            total[ record.action ].qty += record.qty;
            total[ record.action ].price = record.price;
            total[ record.action ].value += record.value;
            total[ record.action ].average = total[ record.action ].value / total[ record.action ].qty;

            total.SUB.qty = total.SELL.qty - total.BUY.qty;
            total.SUB.delta = total.SELL.average - total.BUY.average;
            total.SUB.gain = total.SUB.delta * total.SELL.qty;

            record.gain = total.SUB.gain - previous.amount;
  
            previous.date = date;
        } );

        let content = t2.ui.children.get( "content" );

        let chart = await content.addComponent( { id: "timeline", type: "chart", format: "flex" } );
            chart.addLayer( { color: "green", font: "12px sans-serif", type: "line",
                data: array,
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day, mod: mondays, axis: true } },
                    "1": { axis: "gain", settings: { mod: ( p ) => !( p % 10 ), axis: true } } 
                } } );
            chart.addLayer( { color: "blue", font: "12px sans-serif", type: "step",
                data: array,
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day, axis: false } },
                    "1": { axis: "deposits", settings: { axis: false } } 
                } } );

        function mondays( p, chart )
        {
            let date = new Date( chart.min );
                date.setDate( date.getDate() + p );

            return !date.getDay() || !p || p == chart.divisions; 
        }
    };
};

export default Summary;