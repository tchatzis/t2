const UI = function()
{
    this.tree = new Map();
    this.updates = [];

    this.render = () =>
    {  
        let map = new Map();
        let parent = el( "ul" );
            parent.id = "tree";
        let root = document.createElement( "div" ); 
            root.classList.add( "ui" );
            root.appendChild( parent );
        document.body.appendChild( root );
        
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

        expand( map, parent );
        
        this.updates.forEach( f => f() );
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