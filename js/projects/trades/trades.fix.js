const Fix = function( module )
{
    this.run = async function()
    {
        Object.assign( module, this );

        await this.refresh();  
    };

    this.refresh = async function()
    {
        await module.queries(); 
        await layout();
        await module.transaction();
    };

    async function layout()
    {
        await container();
    }

    async function container()
    {
        let wrapper = t2.ui.children.get( "wrapper" );
            wrapper.clear();

        let breadcrumbs = t2.ui.children.get( "footer.breadcrumbs" );
        
        let details = await wrapper.addContainer( { id: "fix", type: "panels", format: "flex", output: "vertical" } );
            // add panels
            let title = await details.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
                title.set( "Data Tools" );
                await details.setModule( { id: "normalize", label: "normalize", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.normalize.js" } } );
                await details.setModule( { id: "rename", label: "rename", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.rename.js" } } );
                await details.setModule( { id: "repair", label: "repair", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.repair.js" } } );
            let message = await details.setComponent( { id: "columns", type: "message", label: "columns", format: "block", output: "text" } );
                message.set( "//TODO: Overwrite Record Schema" );
            
            let tabs = await details.setComponent( { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" } );
                tabs.addListener( { type: "click", handler: ( active ) => 
                {
                    breadcrumbs.set( 2, active.panel?.label || "" ); 
                    breadcrumbs.unset( 3 );
                } } );    
            tabs.update( details.panels );  
    }
};

export default Fix;