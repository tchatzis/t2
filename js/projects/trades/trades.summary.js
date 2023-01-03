const Tabs = function( module )
{
    let self = this;

    this.init = async function()
    {
        await this.refresh(); 

        await navigation();  
    };

    this.refresh = async function()
    {
        module.unsetDate();
        module.unsetSymbol();

        await module.queries();
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "submargin", functions: [ { ignore: "clear" }, { clear: null }, { show: null } ] }, 
            { id: "menu",       functions: [ { ignore: "clear" }, { hide: null } ] },
            { id: "content",    functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "subcontent",     functions: [ { clear: null }, { hide: null } ] },
            { id: "margin",     functions: [ { clear: null }, { show: null } ] }
        ] );
    }

    // content
    async function output()
    {
        let panels = await this.addComponent( { id: "panels", type: "panels", format: "block", output: "vertical" } );
            await panels.add( "Module", { id: "gains", label: "gains", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.gains.js" } } );
            await panels.add( "Module", { id: "symbols", label: "symbols", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.symbols.js" } } );
            await panels.add( "Module", { id: "closed", label: "closed", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.closed.js" } } );
            await panels.add( "Module", { id: "data", label: "data", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.data.js" } } );
            await panels.add( "Module", { id: "dividends", label: "dividends", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.dividends.js" } } );
            panels.setControls( 
            { 
                breadcrumbs: { index: 2, component: t2.navigation.components.breadcrumbs },
                controller: { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" }
            } );
    }
};

export default Tabs;