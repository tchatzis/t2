const Tree = function( module )
{
    let self = this;
    let active = { curr: null };
    let listeners = new Map();
    
    const Branch = function( params )
    {
        this.children = new Map();
        this.id = t2.common.uuid();
        this.element = document.createElement( "ul" );
        this.element.setAttribute( "data-link", this.id );
        this.label = params.label;
        this.parent = params.parent;
    };
  
    this.init = async function( params )
    {
        this.breadcrumbs = await t2.ui.components.get( "breadcrumbs" );
        this.breadcrumb = params.breadcrumb || 0;
        this.parent = params.parent;
        this.map = new Map();
    };

    this.addBranch = function( params )
    {
        let branch = new Branch( params );

        if ( params.parent )
        {
            let parent = this.map.get( params.parent.id );
                parent.children.set( branch.id, branch );
                parent.element.appendChild( branch.element );  
        }
        else
        {
            this.parent.appendChild( branch.element );
        }

        let div = t2.common.el( "div", branch.element );
            div.classList.add( "link" );
            div.textContent = params.label;
            div.addEventListener( "click", ( e ) => handlers.click( e.target, branch ) );
            div.addEventListener( "contextmenu", ( e ) => handlers.context( e, branch ) );

        let ul = branch.element;
            ul.addEventListener( "drop", dnd.drop );
            ul.addEventListener( "dragover", dnd.allow );

        this.map.set( branch.id, branch );

        return branch;
    };

    this.addListener = function( listener )
    {
        listeners.set( listener, null );
    };

    this.populate = function( _array )
    {
        let array = Array.from( this.map.values() ) || _array;

        if ( !array.length )
            return;

        //console.log( array );
    };

    this.setActive = function( link )
    {
        if ( !link )
            return;
        
        link.classList.add( "active" );

        if ( active.curr && active.curr !== link )
        {
            active.curr.classList.remove( "active" );      
        }

        active.curr = link;  
    };

    this.setBreadcrumbs = function( component )
    {
        this.breadcrumbs = component;
    };

    const breadcrumbs = () =>
    {
        let path = self.path.join( "/" );

        t2.ui.breadcrumbs.splice( self.breadcrumb );
        t2.ui.breadcrumbs[ self.breadcrumb ] = path;

        self.breadcrumbs.setContent( t2.ui.breadcrumbs.join( "/" ) ); 
    };

    const dnd = {};

    dnd.allow = ( e ) =>
    {  
        e.preventDefault(); 
        e.dataTransfer.dropEffect = "move";
     };

    dnd.drag = ( e ) => 
    {
        e.dataTransfer.setData( "text/plain", e.target.dataset.link );
    };

    dnd.drop = ( e ) =>
    {
        e.preventDefault();
        e.stopPropagation();

        // DOM DnD stuff
        let data = e.dataTransfer.getData( "text/plain" );
        let dragged = self.parent.querySelector( `[ data-link = "${ data }" ]` );
        let over = e.target;

        while ( over.tagName !== "UL" )
        {
            over = over.parentNode;
        }

        if ( !dragged )
            return;

        over.appendChild( dragged );
        dragged.removeEventListener( "dragstart", dnd.drag );
        dragged.removeAttribute( "draggable" );
        
        // data stuff
        let parent = self.map.get( over.dataset.link );
        let child = self.map.get( data );

        // remove child from previous branch
        let previous = child.parent;
            previous.children.delete( child.id );

        // set dragged parent to over
        child.parent = parent;

        // add dragged to parent's children
        parent.children.set( child.id, child );
    };

    const handlers = {};

    handlers.add = ( context, _link, _branch ) =>
    {
        context.close();

        let params = {};
            params.label = window.prompt( "add a label" );
            params.parent = _branch;

        let branch = self.addBranch( params );
        let link = branch.element.firstChild;

        handlers.click( link, branch );
    };

    handlers.cancel = ( context, _link, _branch ) =>
    {
        context.close();
    };

    handlers.click = ( link, branch ) =>
    {
        self.setActive( link );
        path( branch );
        breadcrumbs();

        Array.from( listeners.keys() ).forEach( listener => listener.handler( link, branch ) );
    };

    handlers.context = async ( e, branch ) =>
    {
        e.preventDefault();
        e.stopPropagation();

        handlers.click( e.target, branch );

        let link = e.target;

        let context = await t2.ui.addComponent( { component: "context", parent: document.body, link: link } );
            context.addLink( { text: "Add",    f: () => handlers.add( context, link, branch ) } );
            context.addLink( { text: "Rename", f: () => handlers.rename( context, link, branch ) } );
            context.addLink( { text: "Move",   f: () => handlers.move( context, link, branch ) } );
            context.addLink( { text: "Delete", f: () => handlers.delete( context, link, branch ) } );
            context.addLink( { text: "Cancel", f: () => handlers.cancel( context, link, branch ) } );
            context.update();
    };

    handlers.delete = ( context, link, branch ) =>
    {
        if ( !branch.parent )
        {
            window.alert( "Root node cannot be deleted" );

            context.close();
            
            return;
        }
        
        var confirm = window.confirm( "Confirm delete" );

        context.close(); 

        if ( !confirm )
            return;

        link.remove(); 

        let parent = self.map.get( branch.parent.id );
            parent.children.delete( branch.id );

        self.map.delete( branch.id );
    };

    handlers.move = ( context, link, branch ) =>
    {
        context.close(); 

        let ul = branch.element;  
            ul.setAttribute( "draggable", true );
            ul.addEventListener( "dragstart", dnd.drag );
    };

    handlers.rename = ( context, link, branch ) =>
    {
        context.close(); 

        let label = window.prompt( "set new label" );

        branch.label = label;
        link.textContent = label;
    };

    const path = ( branch ) =>
    {
        let temp = { ...branch };

        self.path = [];
        
        while ( temp )
        {
            self.path.unshift( temp.label );
            
            temp = temp.parent;
        }
    };
};

export default Tree;