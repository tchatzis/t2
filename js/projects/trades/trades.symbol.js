import totals from "./trades.calculate.totals.js";

const Symbol = function( module )
{
    let breadcrumbs = t2.ui.children.get( "footer.breadcrumbs" );

    this.run = async function()
    {
        Object.assign( module, this );

        await symbols();

        if ( !module.symbol || module._symbol )
            return;

        await this.refresh();  
    };

    this.refresh = async function()
    {
        delete module.date;
        module.symbol = module._symbol;

        //let subcontent = t2.ui.children.get( "subcontent" );
        //    subcontent.clear();
        
        await module.queries(); 
        await layout();
    };

    async function layout()
    {
        await container();
        await summary(); 
    }

    async function container()
    {
        let content = t2.ui.children.get( "content" );
        //    content.clear();

        let details = await content.addContainer( { id: "details", type: "panels", format: "block", output: "vertical" } );
        let title = await details.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( "Stock Details" );

        await details.setModule( { id: "history", label: "history", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.history.js" } } );
        await details.setModule( { id: "match", label: "match", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.match.js" } } );
        await details.setModule( { id: "totals", label: "totals", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.totals.js" } } );
        await details.setModule( { id: "price", label: "price", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.price.js" } } );
        await details.setModule( { id: "timeline", label: "timeline", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.timeline.js" } } );
        await details.setModule( { id: "gain", label: "gain", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.gain.js" } } );
        
        let array = Array.from( details.panels.keys() );
        
        let tabs = await details.setComponent( { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" } );
            tabs.addListener( { type: "click", handler: ( active ) => 
            {
                module.tab = array.findIndex( id => id == active.id );
                
                title.set( `${ module.symbol } ${ active.id }` );
                
                breadcrumbs.set( 2, module.symbol );
                breadcrumbs.set( 3, active.panel?.label || "" ); 
            } } );  
            tabs.update( details.panels );
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
                input: { name: "buy price", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "buy value", type: "number" }, 
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
                input: { name: "sell price", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "sell value", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number"  ] 
            } );      
            matrix.addRow( { 
                input: { name: "value", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ]
            } );
            matrix.addRow( { 
                input: { name: "percent", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ]
            } );     
            matrix.addRow( { 
                input: { name: "trade", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [ "number" ] 
            } );
            matrix.addRow( { 
                input: { name: "spread", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [ "number" ] 
            } );
            matrix.addRow( { 
                input: { name: "last price", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [ "number" ] 
            } );
            matrix.addRow( { 
                input: { name: "trend", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [ "number" ] 
            } );
            matrix.addRow( { 
                input: { name: "gain", type: "number" }, 
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

    // symbols menu
    async function symbols()
    {
        let menu = t2.ui.children.get( "menu" );

        let symbols = await menu.addComponent( { id: "symbols", type: "menu", format: "block" } );
            symbols.update( module.data.symbol );
            symbols.activate( module.symbol );
            symbols.addListener( { type: "click", handler: function() 
            { 
                let link = arguments[ 2 ].curr;
                let symbol = link.textContent;

                module._symbol = symbol;

                breadcrumbs.set( 2, symbol ); 

                if ( module.symbol )
                {
                    link.classList.remove( "inactive" );
                    
                    module.unsetSymbol( symbol );
                }
                else
                {
                    link.classList.add( "inactive" );
                    
                    module.setSymbol( symbol );
                }
            } } );   

        if ( module.symbol )
            symbols.activate( module.symbol );
    }
};

export default Symbol;