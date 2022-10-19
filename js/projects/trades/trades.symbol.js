import totals from "./trades.calculate.totals.js";

const Symbol = function( module )
{
    this.run = async function()
    {
        Object.assign( module, this );

        if ( !module.symbol )
            return;
        
        await this.refresh();  
    };

    this.refresh = async function()
    {
        delete module.date;
        module.symbol = module._symbol;
        
        await module.queries(); 
        await layout();
        await module.transaction();
    };

    async function layout()
    {
        let date = t2.ui.children.get( "submenu.date" );
            date.hide();

        await container();
        await summary();
    }

    async function container()
    {
        let breadcrumbs = t2.ui.children.get( "footer.breadcrumbs" );
        
        let content = t2.ui.children.get( "content" );
            content.clear();

        let details = await content.addContainer( { id: "details", type: "panels", format: "block", output: "vertical" } );
            // set breadcrumbs
            details.addListener( { type: "click", handler: ( active ) => 
            {
                breadcrumbs.set.path( 2, active.panel?.label || "" );
            } } );
        let title = await details.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( "Stock Details" );
            await details.setModule( { id: "history", label: "history", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.history.js" } } );
            await details.setModule( { id: "match", label: "match", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.match.js" } } );
            await details.setModule( { id: "totals", label: "totals", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.totals.js" } } );

        let tabs = await details.setComponent( { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" } );
            tabs.addListener( { type: "click", handler: ( active ) => title.set( `${ module.symbol } ${ active.id }` ) } );
            tabs.update( details.panels );

        let array = Array.from( details.panels.keys() );

        tabs.activate( array[ 0 ] );
    }

    async function summary()
    {
        if ( !module.symbol )
            return;
        
        let result = await totals( module );
        
        let margin = t2.ui.children.get( "margin" );
            margin.clear();

        let matrix = await margin.addComponent( { id: "matrix", type: "matrix", format: "table-body" } );
            matrix.addRow( { 
                input: { name: "status", type: "text" }, 
                cell: { css: { value: "status" }, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] 
            } );
            matrix.addRow( { 
                input: { name: "buy qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "div qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "sell qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "position", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number"  ] 
            } );            
            matrix.addRow( { 
                input: { name: "break even", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
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
            matrix.populate(
            { 
                data: result, 
                primaryKey: "id",
                column: { name: "brokerage" },
                row: { name: "data" }
            } );
    }
};

export default Symbol;