const Actions = function( module )
{
    let self = this;
    let map = new Map();
    let totals = {};
    
    this.init = async function()
    {
        if ( !module.symbol )
            return;

        // initialize actions map
        module.actions.forEach( action => map.set( action, [] ) );

        // filter by symbol
        this.array = module.data.all.filter( record => record.symbol == module.symbol );

        // split actions
        this.array.forEach( record => map.get( record.action ).push( record ) );

        let promises = [];

        // display tables
        module.actions.forEach( ( action ) => promises.push( totals[ action ] = display( action ) ) );

        await Promise.all( promises );

        submargin()

        return this;
    };

    async function display( action )
    {
        let table = await t2.ui.addComponent( { id: "table", component: "table", parent: t2.ui.elements.get( "content" ), module: module } );
            table.handler = module.handlers.update;    
            table.addColumn( { 
                input: { name: "id", type: "hidden" }, 
                cell: { css: {}, display: 0, modes: [ "edit" ] },
                format: [] } );
            table.addColumn( { 
                input: { name: "date", type: "text" }, 
                cell: { css: { column: "" }, display: 6, modes: [ "read", "edit" ] },
                format: [ "date" ] } );
            table.addColumn( { 
                input: { name: "time", type: "text" }, 
                cell: { css: { column: "" }, display: 6, modes: [ "edit" ] },
                format: [ "time" ] } );
            table.addColumn( { 
                input: { name: "symbol", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "action", type: "text" }, 
                cell: { css: { value: null }, display: 3, modes: [ "read", "edit" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "notes", type: "text" }, 
                cell: { css: { value: "action" }, display: 4, modes: [ "read", "edit" ] } } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 1, min: 0 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read", "edit" ] } } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read", "edit" ] },
                format: [ "precision" ],
                formula: ( args ) => args.totals[ args.column ] = Math.abs( args.totals.value / args.totals.qty ) } );
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "brokerage", type: "text" }, 
                cell: { css: {}, display: 6, modes: [ "edit" ] },
                format: [] } );
            table.addColumn( { 
                input: { type: "submit", value: "UPDATE" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            table.setColumns( module.mode );
            table.populate( { array: map.get( action ), orderBy: "price" } );  
            table.setTotals();   
            
        return table.totals;
    }

    async function submargin()
    {
        let summary = {};
        
        for ( let action in totals )
        {
            if ( totals.hasOwnProperty( action ) )
            {
                summary[ action ] = await totals[ action ];
            }
        }

        let qty = summary.BUY.qty - summary.SELL.qty;
        let value = summary.BUY.value + summary.SELL.value;
        let avg = qty ? value / qty : value / summary.SELL.qty;
        let condition = 1 - ( value > 0 );
        let css = module.actions[ condition ].toLowerCase();
        let color = [ "green", "red" ][ condition ];

        let row = t2.common.el( "div", t2.ui.elements.get( "submargin" ) );
            row.classList.add( "row" );
            row.style.borderLeftColor = color;

        let q = t2.common.el( "div", row );
            q.classList.add( "data" );
            q.classList.add( "totals" );
            q.textContent = qty.toFixed( 0 );            

        let a = t2.common.el( "div", row );
            a.classList.add( "data" );
            a.classList.add( "totals" );
            a.textContent = avg.toFixed( 2 );            

        let v = t2.common.el( "div", row );
            v.textContent = value.toFixed( 2 );
            v.classList.add( "data" );
            v.classList.add( "totals" );
            v.classList.add( css );    
    }; 
};

export default Actions;