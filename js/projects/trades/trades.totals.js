async function totals( total )
{
    let formats = new Map();    
        formats.set( "open", { f: "dollar" } );
        formats.set( "gain", { f: "dollar" } );
        formats.set( "dividend", { f: "dollar" } );
        formats.set( "closed", { f: "dollar" } );  
        formats.set( "price", { f: "dollar" } );
        formats.set( "qty", { f: "precision" } );
        formats.set( "buy", { f: "number" } );
        formats.set( "div", { f: "precision" } );
        formats.set( "sell", { f: "number" } );

    let condition = total.open ? 1 - ( total.gain > 0 ) : 1 - ( total.closed > 0 );
    let color = [ "green", "red" ][ condition ];

    let parent = await t2.ui.root( t2.ui.elements.get( "margin" ).element );
    let container = await parent.addContainer( { id: "day", type: "box", format: "inline-block" } );
    let title = await container.addComponent( { id: "title", type: "title", format: "text" } );
        title.set( "Totals" );

    Array.from( formats.keys() ).forEach( key =>
    {
        if ( total[ key ] )
        {
            let line = t2.common.el( "div", container.element );
                line.classList.add( "row" );
                line.style.borderLeftColor = color;
            
            let params = formats.get( key );
            let name = t2.common.el( "div", line );
                name.classList.add( "data" );
                name.textContent = key;

            let div = t2.common.el( "div", line );
                div.classList.add( "data" );
                div.classList.add( "value" );
                div.textContent = t2.formats[ params.f ]( total[ key ] );
        }
    } );
};

export default totals;