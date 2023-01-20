import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    let self = this;
    let active;
    let div = t2.common.el( "div", document.body );
        div.classList.add( "contextmenu" );
        div.classList.add( "hidden" );

    const Branch = function( params )
    { 
        let delimiter = ".";

        this.uuid = t2.common.uuid();
        this.label = params.label;
        this.element = t2.common.el( "ul", params.parent.element );
        this.detail = {};
        this.detail.uuid = this.uuid;
        this.detail.label = this.label;
        this.detail.element = this.element;

        let path = [ ...params.path ]
            path.push( params.label );

        this.detail.path = [ ...path ].join( delimiter );

        let link = t2.common.el( "div", this.element );
            link.textContent = params.label;
            link.classList.add( "link" );
            link.setAttribute( "data-uuid", this.uuid );
            link.setAttribute( "data-path", path.join( delimiter ) );
            link.addEventListener( "contextmenu", ( e ) => this.modifyBranch( e ) );
            link.addEventListener( "click", () => this.selectBranch( link ) );

        this.detail.link = link;

        if ( params.root )
        {
            this.element.setAttribute( "root", true );
            this.detail.root = true;
            link.setAttribute( "root", true );
        }
        
        this.addBranch = function( params )
        {
            let existing = self.array.find( item => ( item.parent == this.label && item.label == params.label ) );

            if ( existing )
                return existing;
            else
                self.array.push( { parent: this.label, label: params.label } );

            let branch = new Branch( Object.assign( params, { parent: this, path: path } ) );

            this.detail.branch = branch;

            return branch;
        };

        this.selectBranch = function( link )
        {
            link = link.detail ? link.detail.link : link;
            link.classList.add( "active" );

            if ( link !== active )
                active?.classList.remove( "active" );

            active = link;
        };

        // context menu
        this.modifyBranch = async function( e )
        {
            e.preventDefault();
            e.stopPropagation();

            let link = e.target;
            let bbox = link.getBoundingClientRect();

            this.selectBranch( link );

            div.classList.remove( "hidden" );
            div.style.position = "absolute";
            div.style.borderTop = "1px solid #222";
            div.style.left = bbox.x + bbox.width + "px";
            div.style.top  = bbox.y - 2 + "px";
            div.innerHTML = null;

            let timeout = setTimeout( hide, 5000 );

            function hide()
            {
                div.classList.add( "hidden" );
            }

            let child = t2.common.el( "div", div );
                child.textContent = "Add Child";
                child.classList.add( "link" );
                child.addEventListener( "click", ( e ) => 
                {
                    e.stopPropagation();

                    this.childBranch();
                    hide();
                } );

            let rename = t2.common.el( "div", div );
                rename.textContent = "Rename";
                rename.classList.add( "link" );
                rename.addEventListener( "click", ( e ) => 
                {
                    e.stopPropagation();

                    this.renameBranch( link );
                    hide();
                } );

            if ( this.element.hasAttribute( "root" ) )
                return;

            let remove = t2.common.el( "div", div );
                remove.textContent = "Remove";
                remove.classList.add( "link" );
                remove.addEventListener( "click", ( e ) => 
                {
                    e.stopPropagation();

                    this.removeBranch( link );
                    hide();
                } );
        };

        this.childBranch = function()
        {
            let label = window.prompt( "Add child:" );

            if ( label )
                this.addBranch( { label: label } );
        };

        this.removeBranch = function( link )
        {
            let confirm = window.confirm( `Remove ${ link.textContent }?` );

            if ( !confirm )
                return;

            function removeItem( label )
            {
                let index = self.array.findIndex( item => ( item.label == label ) );

                if ( ~index )
                {
                    self.array.splice( index, 1 );
                    
                    let children = self.array.filter( item => ( item.parent == label ) );
                        children.forEach( child => removeItem( child.label ) );
                }
            }

            removeItem( this.label );

            link.parentNode.remove();
        };

        this.renameBranch = function( link )
        {
            let renamed = window.prompt( "New label:" );
            
            if ( !renamed )
                return;

            let children = self.array.filter( item => ( item.parent == this.label ) );
                children.forEach( child => child.parent = renamed );

            link.textContent = renamed;
        };

        const subscription =
        {
            add: ( params ) => 
            {
                let f = this[ params.event ];

                if ( !f || !f instanceof Function )
                    return;

                let after = () =>
                {
                    let event = new CustomEvent( params.event, { detail: this.detail } );

                    this.element.dispatchEvent( event );
                };

                this[ params.event ] = f.extend( null, after );
    
                this.element.addEventListener( params.event, params.handler );
            },
            remove: ( params ) => this.element.removeEventListener( params.event, params.handler )
        };

        // copy subscriptions from root
        for ( let [ event, handler ] of self.subscriptions )
            subscription.add( { event: event, handler: handler } );

        return this;
    };

    this.array = [];

    this.clear = function()
    {
        for ( let child of this.element.children )
            if ( !child.hasAttribute( "root" ) )
                child.remove();
    };
    
    this.init = function( params )
    {
        this.element = t2.common.el( "div", this.parent.element );

        Object.assign( this, params );

        Handlers.call( this );

        Branch.call( this, { label: params.id, parent: this, path: [], root: true } );
    };

    this.object = {};

    this.update = function( params )
    {
        this.clear();

        if ( !params.array )
            return;

        let array = this.array.concat( params.array );

        function tree( array )
        {
            let map = new Map();

            // create the path from array
            let a = [ ...array ];
                a.forEach( node => 
                { 
                    let path = find( node.label, [] )
                    map.set( node.label, path.reverse() );
                } );

            // find the parent
            function find( label, path )
            {
                path.push( label );
                
                let parent = array.find( node => node.label == label )?.parent;

                if ( parent )
                    find( parent, path );

                return path;
            }

            // define the object
            function assign( obj, path ) 
            {
                let last = path.length;

                for ( let i = 0; i < last; ++i ) 
                {
                    let key = path[ i ];

                    if  ( !( key in obj ) )
                        obj[ key ] = {};

                    obj = obj[ key ] ;
                }
             }

            // get / set the parent node and render            
            let parents = new Map();
            let obj = {};

            for ( let [ child, path ] of map )
            {
                // expand the object
                assign( obj, path );
                
                path.forEach( ( label, index ) =>
                {
                    if ( label == self.label )
                    {
                        parents.set( label, self );     
                    }
                    else
                    {
                        let previous = path[ index - 1 ];
                        let parent = parents.get( previous );

                        if ( !parents.get( label ) )
                        {
                            let branch = parent.addBranch( { label: label } );
                            parents.set( label, branch );
                        }
                    }   
                } );   
            }

            self.object = obj;
        }
        
        tree( array );
    };
};

export default Component;