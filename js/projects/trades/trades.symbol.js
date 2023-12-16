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
                { id: "submenu",    functions: [ { ignore: "clear" }, { clear: null }, { show: null }, { invoke: [ { f: limits, args: null } ] } ] }, 
                { id: "subcontent", functions: [ { ignore: "clear" }, { clear: null }, { show: null }, { invoke: [ { f: module.transaction, args: self } ] } ] },
                { id: "submargin",  functions: [ { ignore: "clear" }, { clear: null }, { invoke: [ { f: symbol, args: null } ] } ] },
                { id: "menu",       functions: [ { ignore: "clear" }, { show: null }, { invoke: [ { f: symbols, args: null } ] } ] },
                { id: "content",    functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
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
            symbols.addBreadcrumbs( 3, t2.navigation.components.breadcrumbs );   
            symbols.update( module.data.symbol );
            symbols.highlight( module.symbol );
            symbols.addListener( { type: "click", handler: async function() 
            { 
                let _symbol = symbols.activated.toUpperCase();
                
                module.setSymbol( _symbol );

                self.init();
            } } );  
    }

    // submenu
    function limits()
    {
        let div = document.createElement( "div" );
            div.classList.add( "flex" );
        
        let buy = document.createElement( "div" );
            buy.classList.add( "buy" );
            buy.classList.add( "data" );
        
        let price = document.createElement( "input" );
            price.type = "number";
            price.step = 0.0001;
            price.placeholder = 0.00;
            price.oninput = () =>
            {
                let value = Number( price.value );
                
                if ( !isNaN( value ) )
                {
                    buy.textContent = ( value / 1.2 ).toFixed( 4 );
                    sell.textContent = ( value * 1.2 ).toFixed( 4 );
                }
            };
        
        let sell = document.createElement( "div" );
            sell.classList.add( "sell" );
            sell.classList.add( "data" );
        
        div.appendChild( buy );
        div.appendChild( price );
        div.appendChild( sell );

        submenu.appendChild( div );
    };

    // content
    async function output()
    {
        let panels = await this.addComponent( { id: "panels", type: "panels", format: "block", output: "vertical" } );
            await panels.add( "Module", { id: "history", label: "history", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.history.js" } } );
            await panels.add( "Module", { id: "transactions", label: "transactions", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.transactions.js" } } );
            await panels.add( "Module", { id: "match", label: "match", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.match.js" } } );
            await panels.add( "Module", { id: "totals", label: "totals", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.totals.js" } } );
            await panels.add( "Module", { id: "quantity", label: "quantity", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.quantity.js" } } );
            await panels.add( "Module", { id: "price", label: "price", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.price.js" } } );
            await panels.add( "Module", { id: "value", label: "value", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.value.js" } } );
            panels.tab = tab;
            panels.saveTab = ( t ) => tab = t;
        let tabs = await panels.setControls( 
            { 
                breadcrumbs: { index: 2, component: t2.navigation.components.breadcrumbs },
                controller: { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" }
            } );
            tabs.addListener( { type: "click", handler: () =>
            {
                tabs.updateBreadcrumbs( 3, module.symbol.toUpperCase() );
            } } );
            // update because output loads after symbols
            tabs.updateBreadcrumbs( 3, module.symbol.toUpperCase() );
    }

    // margin
    async function summary()
    {
        let result = await totals( module );
        let gain = { predicate: { conditions: [ { name: "gain", operator: "<", value: 0 } ], options: [ "sell", "buy" ] } }; 

        let matrix = await this.addComponent( { id: "matrix", type: "matrix", format: "table-body" } );
            matrix.addRow( { 
                input: { name: "status", type: "text" }, 
                cell: { css: { value: "status" }, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] 
            } );
            matrix.addRow( { 
                input: { name: "low", type: "number" }, 
                cell: { css: { class: "sell" }, display: 4, modes: [ "read", "edit" ] },
                format: [ "number" ] 
            } );
            matrix.addRow( { 
                input: { name: "high", type: "number" }, 
                cell: { css: { class: "buy" }, display: 4, modes: [ "read", "edit" ] },
                format: [ "number" ] 
            } );

            matrix.addRow( { 
                input: { name: "BUY", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "none" ] } );
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
                input: { name: "DIV", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "none" ] } );
            matrix.addRow( { 
                input: { name: "div qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ] } );
            matrix.addRow( { 
                input: { name: "dividend", type: "number" }, 
                cell: { css: { class: "div" }, display: 4, modes: [ "read" ] },
                format: [ "number" ] } ); 

            matrix.addRow( { 
                input: { name: "SELL", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "none" ] } );
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
                input: { name: "LAST TRANSACTION", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "none" ] } );
            matrix.addRow( { 
                input: { name: "last action", type: "text" }, 
                cell: { css: { value: "last action" }, display: 4, modes: [ "read", "edit" ] },
                format: [ "uppercase" ] 
            } );
            matrix.addRow( { 
                input: { name: "last notes", type: "text" }, 
                cell: { css: { value: "last action" }, display: 4, modes: [ "read", "edit" ] },
                format: [ "uppercase" ] 
            } );
            matrix.addRow( { 
                input: { name: "last qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [ "precision" ] 
            } );
            matrix.addRow( { 
                input: { name: "last price", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [ "precision" ] 
            } );

            matrix.addRow( { 
                input: { name: "POSITION", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "none" ] } );
            matrix.addRow( { 
                input: { name: "qty", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number"  ] 
            } );      
            matrix.addRow( { 
                input: { name: "cost", type: "number" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "number" ]
            } );
            matrix.addRow( { 
                input: { name: "cost per share", type: "number" }, 
                cell: { css: gain, display: 4, modes: [ "read" ] },
                format: [ "number" ]
            } );   
            matrix.addRow( { 
                input: { name: "current value", type: "number" }, 
                cell: { css: gain, display: 4, modes: [ "read" ] },
                format: [ "number", "dollar" ]
            } );
            matrix.addRow( { 
                input: { name: "trend", type: "number" }, 
                cell: { css: gain, display: 4, modes: [ "read", "edit" ] },
                format: [ "number" ] 
            } );
            matrix.addRow( { 
                input: { name: "gain", type: "number" }, 
                cell: { css: gain, display: 4, modes: [ "read" ] },
                format: [ "number", "dollar" ]
            } );   
            matrix.addRow( { 
                input: { name: "percent", type: "number" }, 
                cell: { css: gain, display: 4, modes: [ "read" ] },
                format: [ "number", "dollar" ]
            } );           
            matrix.populate(
            { 
                data: result, 
                primaryKey: "id",
                column: { name: "brokerage" },
                row: { name: "data" }
            } );
    }

    // submargin
    async function symbol()
    {
        let title = await this.addComponent( { id: "symbol", type: "title", format: "block", output: "large" } );
            title.set( module.symbol );
    }
};

export default Tabs;