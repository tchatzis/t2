import { aggregate, reset, total } from "./trades.aggregate.js";

const Summary = function( module )
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
        await layout( preamble() );
    };

    async function layout( array )
    {
        await summary( array );
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
        let content = t2.ui.children.get( "content" );
            content.clear();
        let container = await content.addContainer( { id: "day", type: "box", format: "block" } );
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
};

export default Summary;