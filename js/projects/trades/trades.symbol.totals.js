import Common from "../../t2/t2.container.handlers.js";
import totals from "./trades.calculate.totals.js";

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
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: details, args: null }, { f: summary, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    }  

    async function details()
    {
        let result = await totals( module );

        let container = await this.addContainer( { id: "matrix", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `${ module.symbol } Details` );

        let matrix = await container.addComponent( { id: "matrix", type: "matrix", format: "table-body" } );
            matrix.addRow( { 
                input: { name: "status", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] 
            } );
            matrix.addRow( { 
                input: { name: "qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number"  ] 
            } );            
            matrix.addRow( { 
                input: { name: "trade", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] 
            } );
            matrix.addRow( { 
                input: { name: "spread", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read"] },
                format: [ "number" ] 
            } );
            matrix.addRow( { 
                input: { name: "gain", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ]
            } );
            matrix.addRow( { 
                input: { name: "percent", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ]
            } );
            matrix.addRow( { 
                input: { name: "BUYS", type: "text" }, 
                cell: { css: { class: "buy" }, display: 4, modes: [ "read" ] },
                format: [ "null" ]
            } );
            matrix.addRow( { 
                input: { name: "buy qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "buy price", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "buy value", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "buy trades", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "SELLS", type: "text" }, 
                cell: { css: { class: "sell" }, display: 4, modes: [ "read" ] },
                format: [ "null" ]
            } );
            matrix.addRow( { 
                input: { name: "sell qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "sell price", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "sell value", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "sell trades", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "DIVIDENDS", type: "text" }, 
                cell: { css: { class: "sell" }, display: 4, modes: [ "read" ] },
                format: [ "null" ]
            } );
            matrix.addRow( { 
                input: { name: "div qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "dividend", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "deposits", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );                
            matrix.populate(
            { 
                data: result, 
                primaryKey: "id",
                column: { name: "brokerage" },
                row: { name: "data" }
            } );
    }

    async function summary()
    {
        let sum = ( a, b ) => a + b;
        let round = ( value ) => Math.round( value * 10000 ) / 10000;

        let result = [];
        let totals = { symbol: module.symbol, qty: 0, value: 0 };

        [ "BUY", "SELL" ].forEach( action =>
        {
            let object = {};
            let data = {};      
            let filtered = module.data.filtered.filter( record => record.action == action );

            [ "qty", "value" ].forEach( prop =>
            {
                let reduced = filtered.map( record => record[ prop ] * record.sign ).reduce( sum, 0 );

                data.symbol = module.symbol;
                data[ prop ] = round( reduced );

                totals[ prop ] += data[ prop ];
            } );

            [ "qty", "value" ].forEach( prop => totals[ prop ] = round( totals[ prop ] ) );

            object.column = action;
            object.data = data;

            result.push( object );
        } );

        let object = { column: "\u0394", data: totals }; 

        result.push( object );

        let container = await this.addContainer( { id: "summary", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `${ module.symbol } Summary` );

        let matrix = await container.addComponent( { id: "matrix", type: "matrix", format: "table-body" } );
            matrix.addRow( { 
                input: { name: "qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] 
            } );
            matrix.addRow( { 
                input: { name: "value", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] 
            } );
            matrix.populate(
            { 
                data: result, 
                primaryKey: "symbol",
                column: { name: "column" },
                row: { name: "data" },
                label: module.symbol
            } );
    }
};

export default Panel;
