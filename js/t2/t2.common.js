const Common = function()
{
    let self = this;
    
    this.clear = ( ids ) => 
    {
        ids.forEach( id => 
        {              
            let el = t2.ui.elements.get( id );
            if ( el )
            {
                let children = Array.from( el.children );
                    children.forEach( child =>
                    {   
                        let predicate = this.ignored( "clear", child );

                        if ( !predicate )
                            el.removeChild( child );
                    } );
            }
        } );
    };
    
    this.el = ( tag, parent ) => 
    { 
        let el = document.createElement( tag ); 
        parent.appendChild( el );
        
        return el; 
    };
    
    this.getParent = function( elParams )
    {
        elParams.parent = ( typeof elParams.parent == "object" ) ? elParams.parent : document.getElementById( elParams.parent );

        return elParams.parent;
    };
    
    this.ignored = function( f, child )
    {
        let ignore = child.dataset.ignore ? child.dataset.ignore.split( "," ) : [];
        
        return ignore.find( dataset => f == dataset );
    };
    
    this.sort = ( array, key ) => array.sort( ( a, b ) => ( key ? a[ key ] > b[ key ] : a > b ) ? 1 : -1 );
};

export default Common;