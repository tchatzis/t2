import Listeners from "./ui.listeners.js";

const UI = function()
{
    let scope = this;
    
    this.name = "ui";
    this.tree = new Map();
    this.animations = [];
    this.updates = [];
    
    Listeners.call( this );
      
    let display = el( "ul" );
        display.id = "display";
        display.textContent = "info";
        display.classList.add( "section" );

    let root = document.createElement( "div" ); 
        root.classList.add( "ui" );
        root.appendChild( display );
        document.body.appendChild( root );  
    
    let mouse = el( "div" );
    let grid = el( "div" );
    
    function output( value )
    {
        if ( typeof value == "object" )
            return Object.entries( value ).map( ( v, k ) => `${ v[ 0 ] }: ${ ( Math.round( v[ 1 ] * 100 ) / 100 ).toFixed( 2 ) }` ).join( "\n" );
        else
            return value.toFixed( 2 );
    }
    
    ( function()
    {
        mouse.classList.add( "info" );

        grid.classList.add( "info" );
        grid.classList.add( "info" );
        
        let ul = el( "ul" );
            ul.appendChild( mouse );
            ul.appendChild( grid );
            
        let section = el( "ul" );
            section.textContent = "Cursor";
            section.classList.add( "subsection" );
            section.appendChild( ul );
        display.appendChild( section );
    } )();
    
    this.display = 
    {
        mouse: function( mx, my )
        {
            mouse.textContent = `${ mx } ${ my }`;
            grid.textContent = `${ mx } ${ my }`;
        },
        
        presets:
        {
            animations: ( item ) => `${ item.operation }( ${ item.amount } ): ${ output( item.value ) }`
        },

        set: ( label, array ) =>
        {
            if ( array.length )
            {
                let ul = el( "ul" );
                
                let section = el( "ul" );
                    section.textContent = label;
                    section.classList.add( "subsection" );
                    section.appendChild( ul );
                display.appendChild( section );

                array.forEach( item =>
                {
                    let link = el( "div" );
                        link.textContent = `${ item.name }: ${ item.parent }`;
                        link.classList.add( "link" );
                        link.addEventListener( "click", () => item.animate = !item.animate );
                    ul.appendChild( link );

                    let info = el( "div" );
                        info.id = item.uid;
                        info.classList.add( "info" );
                        window.addEventListener( label, () => info.textContent = this.display.presets[ label ]( item ) );
                    ul.appendChild( info );

                    item.link = link;
                    item.info = info;
                } );
            }
        }
    };

    this.render = () =>
    {  
        let map = new Map();
        let tree = el( "ul" );
            tree.id = "tree";
            tree.textContent = "scene graph";
            tree.classList.add( "section" );
        
        this.tree.forEach( ( object, key ) =>
        {
            object.children.forEach( child => map.set( child.name, object ) );                                     
        } );
        
        function expand( array, element )
        {
            array.forEach( ( object, key ) =>
            {
                let link = el( "div" );
                    link.classList.add( "link" );
                    link.innerText = object.name;
                    link.dataset.type = object.type;
                    link.addEventListener( "click", ( e ) => select( e, object ) );
                let ul = el( "ul" );
                    ul.appendChild( link );
                element.appendChild( ul );

                object.link = link;

                expand( object.children, ul ); 

                map.delete( object.name );
            } );
        }

        expand( map, tree );
        
        root.appendChild( tree );
        
        return true;
    };

    this.state = function( parent, collapse )
    {  
        let action = collapse ? "add" : "remove";

        let array = Array.from( parent.link.parentNode.children );
            array.forEach( child => 
                          {
                if ( child.tagName == "UL" )
                    child.classList[ action ]( "hidden" );
            } );
    };

    function el( tag )
    {
        return document.createElement( tag );
    }
    
    function select( e, object )
    {
        e.preventDefault();
        e.stopPropagation();

        let ul = e.target;

        toggle( ul, object );
    }
    
    function toggle( ul, object )
    {
        ul.classList.toggle( "hide" );
        object.element.classList.toggle( "hidden" );
    }
};

export default UI;