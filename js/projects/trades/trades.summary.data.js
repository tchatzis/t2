import Common from "../../t2/t2.common.handlers.js";
import { aggregate, reset, total } from "./trades.aggregate.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let sum = ( a, b ) => a + b;

    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );
 
        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );
    };

    this.run = async function()
    {
        panel.clear();
        
        await module.queries(); 
        await output();   
    };    

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

    async function output()
    {
        let array = await preamble();
        let qty = { predicate: { conditions: [ { name: "qty", operator: ">", value: 0 } ], options: [ "active", "inactive" ] } };      
        let average = { predicate: { conditions: [ { name: "qty", operator: "==", value: 0 }, { name: "average", operator: ">", value: 0 } ], options: [ "buy", "value" ] } };  
        let gain = { predicate: { conditions: [ { name: "qty", operator: "==", value: 0 }, { name: "gain", operator: "<=", value: 0 } ], options: [ "sell", "value" ] } };
        let dividend = { predicate: { conditions: [ { name: "dividend", operator: ">", value: 0 } ], options: [ "buy", "value" ] } }; 

        let table = await panel.addComponent( { id: "aggregates", type: "table" } );  
            table.addRowListener( { type: "contextmenu", handler: () => {} } );
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

export default Panel;