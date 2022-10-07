async function totals( total )
{
    let formats = new Map();    
        // values
        formats.set( "bought", { f: "dollar" } );
        formats.set( "sold", { f: "dollar" } );
        formats.set( "open", { f: "dollar" } );
        // closed
        formats.set( "closed", { f: "dollar" } );  
        formats.set( "dividend", { f: "dollar" } );
        formats.set( "average", { f: "dollar" } );
        // quantities
        formats.set( "div", { f: "precision" } );
        formats.set( "buy", { f: "number" } );
        formats.set( "sell", { f: "number" } );
        formats.set( "qty", { f: "precision" } );

    //let condition = total.open ? 1 - ( total.gain > 0 ) : 1 - ( total.closed > 0 );
    let color = [ "green", "red" ];//[ condition ];

    let parent = await t2.ui.root( t2.ui.children.get( "margin" ).element );
    let container = await parent.addContainer( { id: "day", type: "box", format: "inline-block" } );
    let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
        title.set( "Totals" );

    Array.from( formats.keys() ).forEach( key =>
    {
        let condition = total[ key ] > 0;
        
        //if ( total[ key ] )
        {
            let line = t2.common.el( "div", container.element );
                line.classList.add( "row" );
                line.style.borderLeftColor = color[ 1 - condition ];
            
            let params = formats.get( key );
            let name = t2.common.el( "div", line );
                name.classList.add( "data" );
                name.textContent = key;

            let div = t2.common.el( "div", line );
                div.classList.add( "data" );
                div.classList.add( "value" );
                div.textContent = t2.formats[ params.f ]( total[ key ] );
                div.style.minWidth = "10em";
        }
    } );
};

export default totals;