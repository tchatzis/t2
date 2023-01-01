import totals from "./trades.calculate.totals.js";

const Tabs = function( module )
{
    let self = this;
    let tab = 0;
    
    this.init = async function()
    {   
        await this.refresh(); 

        await navigation();         
    };

    this.refresh = async function()
    {
        module.unsetDate();

        if ( !module.symbol )
            return;

        await module.queries(); 
    };
    
    async function navigation()
    {
        if ( module.symbol )
            await t2.navigation.update( 
            [ 
                { id: "submenu",    functions: [ { ignore: "clear" }, { clear: null }, { hide: null } ] }, 
                { id: "subcontent", functions: [ { ignore: "clear" }, { clear: null }, { show: null }, { invoke: [ { f: module.transaction, args: self } ] } ] },
                { id: "submargin",  functions: [ { ignore: "clear" }, { clear: null }, { show: null } ] },
                { id: "menu",       functions: [ { ignore: "clear" }, { show: null }, { invoke: [ { f: symbols, args: null } ] } ] },
                { id: "content",    functions: [ { clear: null }, { invoke: [ { f: container, args: null } ] } ] },
                { id: "margin",     functions: [ { clear: null }, { invoke: [ { f: summary, args: null } ] } ] }
            ] );
        else
            await t2.navigation.update( 
            [ 
                { id: "submenu",    functions: [ { ignore: "clear" }, { clear: null }, { hide: null } ] }, 
                { id: "subcontent", functions: [ { ignore: "clear" }, { clear: null }, { show: null } ] },
                { id: "submargin",  functions: [ { ignore: "clear" }, { clear: null }, { show: null } ] },
                { id: "menu",       functions: [ { ignore: "clear" }, { show: null }, { invoke: [ { f: symbols, args: null } ] } ] },
                { id: "content",    functions: [ { clear: null } ] },
                { id: "margin",     functions: [ { clear: null } ] }
            ] );      
    }

    // menu
    async function symbols()
    {
        let symbols = this.children.get( "symbols" );
            symbols.addBreadcrumbs( 2, t2.navigation.components.breadcrumbs );   
            symbols.update( module.data.symbol );
            symbols.highlight( module.symbol );
            symbols.addListener( { type: "click", handler: async function() 
            { 
                module.setSymbol( symbols.activated.toUpperCase() );

                self.init();
            } } );  
    }

    // content
    async function container()
    {
        let details = await this.addContainer( { id: "panels", type: "panels", format: "block", output: "vertical" } );
            
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
            tabs.addBreadcrumbs( 3, t2.navigation.components.breadcrumbs );    
            tabs.addListener( { type: "click", handler: ( active ) => 
            {
                tab = array.findIndex( id => id == active.id );

                title.set( `${ module.symbol } ${ active.id }` );
            } } );  
            tabs.update( details.panels );
            tabs.activate( array[ tab || 0 ] );
    }

    // margin
    async function summary()
    {
        let result = await totals( module );

        let matrix = await this.addComponent( { id: "matrix", type: "matrix", format: "table-body" } );
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
};

export default Tabs;