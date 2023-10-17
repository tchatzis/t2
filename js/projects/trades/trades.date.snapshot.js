import Common from "../../t2/t2.container.handlers.js";
import aggregate from "./trades.aggregate.js";

const Panel = function( module )
{
    let self = this;
    let panel;

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
            { id: "submenu", functions: [ { ignore: "clear" }, { clear: null } ] }, 
            { id: "subcontent", functions: [ { ignore: "clear" } ] },
            { id: "submargin", functions: [ { ignore: "clear" }, { clear: null } ] },
            { id: "menu", functions: [ { ignore: "clear" } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    }

    function preamble()
    {
        let array = [];

        module.data.symbol.forEach( symbol => 
        {
            let records = module.data.all.filter( record => record.symbol == symbol );

            array.push( aggregate.call( module, symbol, records ) );
        } );

        return array;
    }

    async function output()
    {
        let array = await preamble();

        // css
        let status = { predicate: { conditions: [ { name: "total_gain", operator: ">=", value: 0 } ], options: [ "gain", "loss" ] } };   
        let qty = { predicate: { conditions: [ { name: "open_qty", operator: ">", value: 0 } ], options: [ "number", "data" ] } };    
        let open = { predicate: { conditions: [ { name: "open_gain", operator: "<=", value: 0 } ], options: [ "sell", "buy" ] } };
        let gain = { predicate: { conditions: [ { name: "total_gain", operator: "<=", value: 0 } ], options: [ "sell", "buy" ] } };
        let net = { predicate: { conditions: [ { name: "total_net", operator: "<=", value: 0 } ], options: [ "sell", "buy" ] } };
        let div = { predicate: { conditions: [ { name: "div_value", operator: ">", value: 0 } ], options: [ "buy", "data" ] } };

        let table = await this.addComponent( { id: "aggregates", type: "table" } );  
            //table.addRowListener( { type: "contextmenu", handler: () => {} } );
            table.addRowListener( { type: "click", handler: async function( submit ) 
            { 
                let symbol = submit.data.symbol.toUpperCase();
                
                module.setSymbol( symbol );

                await t2.navigation.path( `/symbol/${ symbol }` );
            } } );  
            table.addRowModifier( ( row, record, index ) => record.open_qty ? row.classList.add( "highlighted" ) : row.classList.add( "faded" ) );
            table.addColumn( { 
                input: { name: "symbol", type: "text" }, 
                cell: { css: status, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } );
        module.data.brokerage.forEach( brokerage =>
        {
            let qty = { predicate: { conditions: [ { name: brokerage, operator: "<", value: 0 } ], options: [ "sell", "data" ] } }; 

            table.addColumn( { 
                input: { name: brokerage, type: "number", step: 0.001 }, 
                cell: { css: qty, display: 8, modes: [ "read" ] },
                format: [] } );
        } );
            table.addColumn( { 
                input: { name: "open_qty", type: "number", step: 1, min: 0 }, 
                cell: { css: qty, display: 6, modes: [ "read" ] },
                format: [ "auto" ] } );
            table.addColumn( { 
                input: { name: "buy_price", type: "number", step: 0.001 }, 
                cell: { css: {}, display: 6, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) =>
                {
                    args.totals[ args.column ] = 0;

                    return args.value;
                } } );
            table.addColumn( { 
                input: { name: "open_price", type: "number", step: 0.001 }, 
                cell: { css: {}, display: 6, modes: [ "read" ] },
                format: [ "dollar" ] } );
            table.addColumn( { 
                input: { name: "open_gain", type: "number", step: 0.001 }, 
                cell: { css: open, display: 6, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) =>
                {
                    args.totals[ args.column ] = 0;

                    return args.value;
                } } );
            table.addColumn( { 
                input: { name: "open_value", type: "number", step: 0.001 }, 
                cell: { css: {}, display: 6, modes: [ "read" ] },
                format: [ "dollar" ] } );
            table.addColumn( { 
                input: { name: "div_value", type: "number", step: 0.001 }, 
                cell: { css: div, display: 6, modes: [ "read" ] },
                format: [ "dollar" ] } );
            table.addColumn( { 
                input: { name: "total_gain", type: "number", step: 0.001 }, 
                cell: { css: gain, display: 6, modes: [ "read" ] },
                format: [ "dollar" ] } ); 
            table.addColumn( { 
                input: { name: "total_net", type: "number", step: 0.001 }, 
                cell: { css: net, display: 6, modes: [ "read" ] },
                format: [ "dollar" ] } );     
            table.populate( { array: array, orderBy: "symbol" } );
            table.setTotals();
    }
};

export default Panel;