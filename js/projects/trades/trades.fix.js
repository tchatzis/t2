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
        module.unsetSymbol();
        module.unsetDate();

        await module.queries();
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "submenu",    functions: [ { clear: null }, { hide: null } ] },
            { id: "subcontent", functions: [ { clear: null }, { hide: null } ] },
            { id: "submargin",  functions: [ { clear: null }, { hide: null } ] },
            { id: "menu",       functions: [ { ignore: "clear" }, { hide: null } ] },
            { id: "content",    functions: [ { clear: null }, { invoke: [ { f: container, args: null } ] } ] },
            { id: "margin",     functions: [ { clear: null } ] }
        ] );
    }

    async function container()
    {
        let details = await this.addContainer( { id: "panels", type: "panels", format: "flex", output: "vertical" } );

        let title = await details.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( "Data Tools" );

        await details.setModule( { id: "normalize", label: "normalize", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.normalize.js" } } );
        await details.setModule( { id: "rename", label: "rename", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.rename.js" } } );
        await details.setModule( { id: "repair", label: "repair", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.repair.js" } } );
        
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