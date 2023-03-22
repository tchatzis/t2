const DND = function()
{
    let scope = this;
        scope.offset = 0;
    let type = 'application/x-moz-node';

    this.disable = ( index ) => 
    {
        scope.items[ index ].removeAttribute( "draggable" );
        scope.items[ index ].setAttribute( "data-disabled", "drop" );
        scope.offset++;
    };

    this.enable = ( item, index ) => 
    {
        item.setAttribute( "draggable", true ) 
        item.setAttribute( "data-index", index );
        item.addEventListener( 'dragstart', scope.start );
        item.addEventListener( 'dragover', scope.over );
        item.addEventListener( 'dragenter', scope.enter );
        item.addEventListener( 'dragleave', scope.leave );
        item.addEventListener( 'dragend', scope.end );
        item.addEventListener( 'drop', scope.drop );
    };
    
    this.drop = ( e ) =>
    {
        e.stopPropagation();

        var el = scope.find( e ); 
        var args = {};

        if ( el.hasAttribute( "data-disabled" ) )
            return false;

        if ( scope.parent )
        {
            if ( scope.element !== el )  
            {
                scope.parent.insertBefore( scope.element, el );

                args.parent = scope.parent;
                args.element = scope.element;

                scope.reorder( el );
                scope.callback( el, args );
            }
        }
        else
        {
            args.parent = el;
            args.element = scope.element;

            if ( args.parent !== args.element )  
                el.appendChild( scope.element );
        }

        this.callback( e, args );

        return false;
    };
    
    this.end = ( e ) =>
    {
        e.target.style.opacity = 1;

        scope.items.forEach( item => item.classList.remove( "over" ) );
    };

    this.enter = ( e ) =>
    {
        var el = scope.find( e ); 
        
        if ( el.hasAttribute( "data-disabled" ) )
            return false;

        el.classList.add( "over" );
    };

    this.find = function( e )
    {
        let node = e.target;

        while ( node.tagName !== this.tag )
        {
            node = node.parentNode;
        }

        return node;
    };

    this.leave = ( e ) =>
    {
        var el = scope.find( e );   
            el.classList.remove( "over" );
    };

    this.branch = ( index, element, tag, values, callback ) =>
    {
        scope.callback = callback || function(){};
        scope.element = element;
        scope.element.setAttribute( "data-index", index );
        scope.tag = tag;
        scope.values = values;

        this.enable( scope.element, index );
    };

    this.init = ( parent, tag, values, callback ) =>
    {
        scope.callback = callback || function(){};
        scope.parent = parent;
        scope.tag = tag;
        scope.items = Array.from( scope.parent.children );
        scope.values = values;

        scope.items.forEach( ( item, index ) => this.enable( item, index ) );
    };

    this.items = [];

    this.over = ( e ) =>
    {
        e.preventDefault();

        return false;
    };

    this.reorder = ( el ) =>
    {        
        var dropIndex = Number( el.dataset.index ) - scope.offset;
        var dragIndex = Number( scope.element.dataset.index ) - scope.offset;
        var dragValue = scope.values.splice( dragIndex, 1 )[ 0 ];

        scope.values.splice( dropIndex, 0, dragValue );
    };

    this.start = ( e ) =>
    {
        scope.element = e.target;

        e.target.style.opacity = 0.5;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData( type, e.target );
    };
};

export default DND;