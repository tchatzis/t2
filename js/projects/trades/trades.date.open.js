import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module, array, symbols )
{   
    let self = this;
        self.summary = [];
    let panel;
    //let _array = array.filter( record => record.symbol.charCodeAt( 0 ) < 256 );
    let sum = ( a, b ) => a + b;
    let previous = { cell: null, popup: null };

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
        let get = ( symbol ) => 
        {
            let records = module.data.all.filter( record => record.symbol == symbol );
            let _array = array.find( record => record.symbol == symbol );
            let data = {};
                data.transactions = _array.transactions;
                data.change = _array.qty;
                data.qty = records.map( record => record.qty * -record.sign ).reduce( sum, 0 );
                data.value = _array.value;
                data.gain = records.map( record => record.value * record.sign ).reduce( sum, 0 );

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
                input: { name: "change", type: "number" }, 
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
                input: { name: "gain", type: "number" }, 
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
        let array = module.data.filtered.filter( record => ( t2.formats.isoDate( record.datetime ) == module.date ) && record.symbol == column );

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

export default Panel;