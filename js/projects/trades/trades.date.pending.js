import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module )
{   
    let self = this;
        self.summary = [];
    let panel;
    let sum = ( a, b ) => a + b;
    let previous = { cell: null, popup: null };

    const pending =
    [
        { brokerage: "JPMorganChase", symbol: "AGNC", action: "SELL", qty: 25, price: 12.00 },
        { brokerage: "JPMorganChase", symbol: "AGNC", action: "SELL", qty: 19, price: 12.00 },

        { brokerage: "JPMorganChase", symbol: "BKSY", action: "SELL", qty: 5, price: 1.64 },
        { brokerage: "JPMorganChase", symbol: "BKSY", action: "SELL", qty: 95, price: 2.37 },
        { brokerage: "JPMorganChase", symbol: "BKSY", action: "SELL", qty: 40, price: 2.55 },
        { brokerage: "JPMorganChase", symbol: "BKSY", action: "SELL", qty: 41, price: 2.56 },
        { brokerage: "JPMorganChase", symbol: "BKSY", action: "SELL", qty: 25, price: 2.60 },
        { brokerage: "JPMorganChase", symbol: "BKSY", action: "SELL", qty: 34, price: 2.65 },
        { brokerage: "JPMorganChase", symbol: "BKSY", action: "SELL", qty: 60, price: 2.67 },
        { brokerage: "JPMorganChase", symbol: "BKSY", action: "SELL", qty: 45, price: 2.78 },
        { brokerage: "JPMorganChase", symbol: "BKSY", action: "SELL", qty: 55, price: 2.82 },

        { brokerage: "JPMorganChase", symbol: "SOND", action: "SELL", qty: 10, price: 12.00 },
        { brokerage: "JPMorganChase", symbol: "SOND", action: "SELL", qty: 17, price: 45.00 },
        { brokerage: "JPMorganChase", symbol: "SOND", action: "SELL", qty: 15, price: 15.00 },
        //{ brokerage: "JPMorganChase", symbol: "SOND", action: "SELL", qty: 9, price: 16.00 },

        { brokerage: "JPMorganChase", symbol: "T", action: "SELL", qty: 20, price: 20.75 },
        { brokerage: "JPMorganChase", symbol: "T", action: "SELL", qty: 10, price: 20.85 },
        { brokerage: "JPMorganChase", symbol: "T", action: "SELL", qty: 19, price: 21.05 },
        { brokerage: "JPMorganChase", symbol: "T", action: "SELL", qty: 6, price: 21.50 },
        { brokerage: "JPMorganChase", symbol: "T", action: "SELL", qty: 20, price: 22.00 },
        { brokerage: "JPMorganChase", symbol: "T", action: "SELL", qty: 20, price: 22.00 }
    ];

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
            { id: "menu", functions: [ { ignore: "clear" } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    } 

    // content
    async function output()
    {
        summarize();
        summary.call( this );  
    }

    function summarize()
    {
        let symbols = pending.map( record => record.symbol );
        
        let get = ( symbol ) => 
        {
            let records = pending.filter( record => record.symbol == symbol );
            let _array = module.data.all.filter( record => ( record.symbol == symbol && record.brokerage == "JPMorganChase" ) )
            let data = {};
                data.transactions = records.length;
                data.qty = records.map( record => record.qty ).reduce( sum, 0 );
                data.position = _array.map( record => record.qty ).reduce( sum, 0 );// * -record.sign
                data.remaining = data.position - data.qty;
                data.value = records.map( record => record.qty * record.price ).reduce( sum, 0 );

            return data;
        }

        symbols.forEach( symbol => self.summary.push( { symbol: symbol, data: get( symbol ) } ) );
    }

    async function summary()
    {
        let matrix = await this.addComponent( { id: "matrix", type: "matrix", format: "table-body" } );
            matrix.addCellListener( { type: "contextmenu", handler: records } );
            matrix.addRow( { 
                input: { name: "transactions", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "auto", "number" ] } );
            matrix.addRow( { 
                input: { name: "qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "auto", "number" ] } );
            matrix.addRow( { 
                input: { name: "value", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "auto", "number" ] } );                 
            matrix.addRow( { 
                input: { name: "position", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "auto", "number" ] } );   
            matrix.addRow( { 
                input: { name: "remaining", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "auto", "number" ] } );     
            matrix.populate(
            { 
                data: self.summary, 
                primaryKey: "id",
                column: { name: "symbol" },
                row: { name: "data" }
            } );
    }

    // week cell popup
    async function records( td, key, column )
    {
        let array = pending.filter( record => record.symbol == column );

        let submargin = t2.ui.children.get( "submargin" );
        
        let popop = await submargin.addContainer( { id: "popop", type: "popup", format: "block" } );
            popop.reset();
            popop.setExit( () => td.classList.remove( "highlight" ) );

        let container = await popop.addContainer( { id: "edit", type: "box", format: "block" } );
            container.element.style.position = "relative";
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( column );  

        let table = await container.addComponent( { id: "records", type: "table" } );
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
                    let value = args.record[ args.column ];
                    
                    args.totals[ args.column ] += value;

                    return value;
                } } );
            table.addColumn( { 
                input: { name: "position", type: "number", step: 0.0001 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read" ] },
                format: [ "auto" ],
                formula: ( args ) =>
                {
                    let value = args.record[ args.column ];
                    
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
                    let value = args.record.price * args.record.qty;
                    
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

export default Panel;