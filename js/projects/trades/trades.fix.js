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
            { id: "content",    functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin",     functions: [ { clear: null } ] }
        ] );
    }

    async function output()
    {
        let panels = await this.addComponent( { id: "panels", type: "panels", format: "block", output: "vertical" } );
            //await panels.add( "Module", { id: "normalize", label: "normalize", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.normalize.js" } } );
            await panels.add( "Module", { id: "rename", label: "rename", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.rename.js" } } );
            await panels.add( "Module", { id: "repair", label: "repair", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.repair.js" } } );
            panels.setControls( 
            { 
                breadcrumbs: { index: 2, component: t2.navigation.components.breadcrumbs },
                controller: { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" }
            } );
    }
};

export default Tabs;