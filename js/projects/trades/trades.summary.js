const Summary = function( module )
{
    let self = this;
    let content = t2.ui.children.get( "content" );
    let subcontent = t2.ui.children.get( "subcontent" );
        subcontent.clear();
    let breadcrumbs = t2.ui.children.get( "footer.breadcrumbs" );
    
    this.run = async function()
    {
        Object.assign( module, this );

        await this.refresh();  
    };

    this.refresh = async function()
    {
        delete module.date;
        delete module.symbol;

        content.clear();

        container();
    };

    async function container()
    {
        let details = await content.addContainer( { id: "details", type: "panels", format: "block", output: "vertical" } );
            // set breadcrumbs
            details.addListener( { type: "click", handler: ( active ) => 
            {
                breadcrumbs.set.path( 2, active.panel?.label || "" );
            } } );
        let title = await details.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( "Summary Details" );
            await details.setModule( { id: "gains", label: "gains", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.gains.js" } } );
            await details.setModule( { id: "symbols", label: "symbols", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.symbols.js" } } );
            await details.setModule( { id: "data", label: "data", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.data.js" } } );
            await details.setModule( { id: "dividends", label: "dividends", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.summary.dividends.js" } } );
        
        let array = Array.from( details.panels.keys() );
        
        let tabs = await details.setComponent( { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" } );
        tabs.addListener( { type: "click", handler: ( active ) => 
        {
            module.tab = array.findIndex( id => id == active.id );
            
            title.set( `${ active.id }` );
            
            breadcrumbs.set( 2, active.panel?.label || "" ); 
        } } );  
        tabs.update( details.panels );
        tabs.activate( "gains" );
    }
};

export default Summary;