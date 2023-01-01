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
        module.unsetSymbol();

        await module.queries();
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "submargin", functions: [ { ignore: "clear" }, { clear: null }, { show: null } ] }, 
            { id: "menu",       functions: [ { ignore: "clear" }, { hide: null } ] },
            { id: "content",    functions: [ { clear: null }, { invoke: [ { f: container, args: null } ] } ] },
            { id: "subcontent",     functions: [ { clear: null }, { hide: null } ] },
            { id: "margin",     functions: [ { clear: null }, { show: null } ] }
        ] );
    }

    async function container()
    {
        let details = await this.addContainer( { id: "panels", type: "panels", format: "block", output: "vertical" } );

        let title = await details.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( "Summary Details" );

        await details.setModule( { id: "gains", label: "gains", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.gains.js" } } );
        await details.setModule( { id: "symbols", label: "symbols", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.symbols.js" } } );
        await details.setModule( { id: "closed", label: "closed", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.closed.js" } } );
        await details.setModule( { id: "data", label: "data", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.data.js" } } );
        await details.setModule( { id: "dividends", label: "dividends", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.dividends.js" } } );
        
        let array = Array.from( details.panels.keys() );
        
        let tabs = await details.setComponent( { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" } );
            tabs.addBreadcrumbs( 2, t2.navigation.components.breadcrumbs );    
            tabs.addListener( { type: "click", handler: ( active ) => 
            {
                tab = array.findIndex( id => id == active.id );
                
                title.set( `${ active.id }` );
            } } );  
            tabs.update( details.panels );
            tabs.activate( array[ tab || 0 ] );
    }
};

export default Tabs;