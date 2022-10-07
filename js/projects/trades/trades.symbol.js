import { aggregate, reset, total } from "./trades.aggregate.js";
import totals from "./trades.totals.js";

const Symbol = function( module )
{
    let panels;
    
    this.init = async function()
    {
        await layout();
        
        if ( !module.symbol )
            return;

        let records = module.data.all.filter( record => record.symbol == module.symbol );
        reset();
        aggregate( module.symbol, records )
        totals( total );

        await container();
    };

    async function layout()
    {
        let symbols = t2.ui.children.get( "menu.symbols" );
            symbols.show();

        let date = t2.ui.children.get( "submenu.date" );
            date.hide();
    }

    async function container()
    {
        let breadcrumbs = t2.ui.children.get( "footer.breadcrumbs" );
        
        let content = t2.ui.children.get( "content" );

        let details = await content.addContainer( { id: "details", type: "panels", format: "block", output: "vertical" } );
            // set breadcrumbs
            details.addListener( { type: "click", handler: ( active ) => 
            {
                breadcrumbs.set.path( 2, active.panel?.label || "" );
            } } );
        let title = await details.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( "Stock Details" );
            await details.setModule( { id: "match", label: "match", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.match.js" } } );
            await details.setModule( { id: "history", label: "history", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.symbol.history.js" } } );

        let tabs = await details.setComponent( { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" } );
            tabs.addListener( { type: "click", handler: ( active ) => title.set( `${ module.symbol } ${ active.id }` ) } );
            tabs.update( details.panels );

        let array = Array.from( details.panels.keys() );

        tabs.activate( array[ 0 ] );
    }
};

export default Symbol;