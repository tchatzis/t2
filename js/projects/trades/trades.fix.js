const Fix = function( module )
{
    let self = this;
    let breadcrumbs;
    let content;
    let panels;

    this.init = async function()
    {
        breadcrumbs = t2.ui.children.get( "footer.breadcrumbs" );
        breadcrumbs.unset( 2 );

        content = t2.ui.children.get( "content" );
        
        await layout();
        await container();
    };

    function layout()
    {
        let symbol = t2.ui.children.get( "menu.symbols" );
            symbol.hide();

        let date = t2.ui.children.get( "submenu.date" );
            date.hide();

        content.clear();
    }

    async function container()
    {
        let details = await content.addContainer( { id: "fix", type: "panels", format: "flex", output: "vertical" } );
            // set breadcrumbs
            details.addListener( { type: "click", handler: ( active ) => 
            {
                breadcrumbs.set.path( 2, active.panel?.label || "" );
            } } );
            // add panels
            let title = await details.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
                title.set( "Data Tools" );
                await details.setModule( { id: "normalize", label: "normalize", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.normalize.js" } } );
                await details.setModule( { id: "rename", label: "rename", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.rename.js" } } );
                await details.setModule( { id: "repair", label: "repair", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.repair.js" } } );
            let message = await details.setComponent( { id: "columns", type: "message", label: "columns", format: "block", output: "text" } );
                message.set( "//TODO: Overwrite Record Schema" );
            
            let tabs = await details.setComponent( { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" } );
                tabs.update( details.panels );  
    }
};

export default Fix;