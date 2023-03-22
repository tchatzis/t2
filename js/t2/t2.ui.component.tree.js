import DND from "../modules/dnd.js";
import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    let self = this;
    let active;
    let dnd = new DND();
    let lookup = new Map();
    let div = t2.common.el( "div", document.body );
        div.classList.add( "contextmenu" );
        div.classList.add( "hidden" );

    const Branch = function( params )
    { 
        let delimiter = ".";

        this.uuid = t2.common.uuid();
        this.label = params.label;
        this.config = params.config;
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
            link.setAttribute( "data-label", params.label );
            link.setAttribute( "data-uuid", this.uuid );
            link.setAttribute( "data-parent", params.parent.label );
            link.setAttribute( "data-path", path.join( delimiter ) );
            link.addEventListener( "contextmenu", ( e ) => this.modifyBranch( e ) );
            link.addEventListener( "click", ( e ) => 
            {
                this.selectBranch( link );
            } );

        this.detail.link = link;
  
        if ( params.root )
        {
            this.element.setAttribute( "root", true );
            this.detail.root = true;

            link.setAttribute( "root", true );
            link.setAttribute( "data-disabled", true );
        }
        
        this.addBranch = function( params )
        {
            let existing = self.array.find( item => ( item.parent == this.label && item.label == params.label ) );

            if ( existing )
                return this;
            else
                self.array.push( { parent: this.label, label: params.label } );

            let branch = new Branch( Object.assign( params, { parent: this, path: path } ) );
            let lid = `${ this.label }.${ params.label }`;

            lookup.set( lid, branch );

            this.detail.branch = branch;

            return branch;
        };

        this.changeParent = function( args )
        {
            let dropUL = args.parent;
            let dragUL = args.element;
            let dropDIV = getLink( dropUL );
            let dragDIV = getLink( dragUL );

            if ( !dropDIV || !dragDIV )
                return;

            let parent = dropDIV.dataset.label;
            let original = dragDIV.dataset.parent;
            let label  = dragDIV.dataset.label;
            let map = unroll( self.array );
            let params = map.get( parent );
                params.path.push( label );

            dragDIV.dataset.parent = parent;
            dragDIV.dataset.path = params.path.join( "." );

            this.detail.original = original;
            this.detail.parent = parent;
            this.detail.label = label;
  
            function getLink( ul )
            {
                for ( let i = 0; i < ul.children.length; i++ )
                {
                    let div = ul.children[ i ];
    
                    if ( div.tagName == "DIV" )
                        return div;
                } 
            }
        };

        this.getBranch = function( params )
        {
            let path = `${ params.parent }.${ params.label }`;

            return lookup.get( path );
        };

        this.selectBranch = function( link )
        {
            switch ( self.output )
            {
                case "dual":
                    this.visibility();
                break;

                default:
                    link.classList.add( "active" );

                    if ( link !== active )
                    {
                        if ( active )
                        {
                            active.classList.remove( "active" );
                        }
                    }
                break;
            }
 
            active = link;
        };

        // context menu
        this.modifyBranch = async function( e )
        {
            e.preventDefault();
            e.stopPropagation();

            let link = e.target;
            let bbox = link.getBoundingClientRect();

            //this.selectBranch( link );

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

            let select = t2.common.el( "div", div );
                select.textContent = "Select";
                select.classList.add( "link" );
                select.addEventListener( "click", ( e ) => 
                {
                    e.stopPropagation();

                    this.selectBranch( link );
                    hide();
                } );

            if ( this.element.hasAttribute( "root" ) )
                return;

            let parent = t2.common.el( "div", div );
                parent.textContent = "Change Parent";
                parent.classList.add( "link" );
                parent.addEventListener( "click", ( e ) => 
                {
                    e.stopPropagation();

                    this.changeParent( link );
                    hide();
                } );                

            let remove = t2.common.el( "div", div );
                remove.textContent = "Remove";
                remove.classList.add( "link" );
                remove.addEventListener( "click", ( e ) => 
                {
                    e.stopPropagation();

                    this.removeBranch( link );
                    hide();
                } );

            let path = t2.common.el( "div", div );
                path.textContent = link.dataset.path;
                path.classList.add( "link" );
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
                    let length = chilren.length;

                    for ( let i = 0; i < length; i++ )
                    {       
                        let child = children[ i ];
                        removeItem( child.label )
                    }
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

            let delimiter = ".";
 
            let item = self.array.find( item => ( item.parent == link.dataset.parent && item.label == link.textContent ) );
                item.label = renamed;

            this.detail.label = renamed;
            this.detail.original = link.textContent;
            this.detail.parent = link.dataset.parent;

            let path = this.detail.path.split( delimiter );
                path.pop();
                path.push( renamed );
            this.detail.path = path.join( delimiter );

            let children = self.array.filter( item => ( item.parent == this.label ) );
                children.forEach( child => 
                {
                    child.parent = renamed;
                    link.dataset.parent = renamed;
                } );

            link.textContent = renamed;
        };

        this.visibility = function()
        {
            if ( !this.config )
                return;

            if ( this.config.visible )
            {
                link.style.borderLeftColor = this.config.color;
                link.classList.remove( "inactive" );
            }
            else
            {
                link.style.borderLeftColor = "#222";
                link.classList.add( "inactive" );
            }  

            //this.config.visible = !this.config.visible;
        }

        this.visibility();

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

        if ( this.output.dual )
            this.visibility();
    };

    this.object = {};

    this.update = function( params )
    {
        this.clear();

        if ( !params.array )
            return;

        let array = params.refresh ? params.array : this.array.concat( params.array );
        let i = 0;

        function tree( array )
        {
            let map = unroll( array );

            /* define the object
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

               return obj;
            }*/

            // get / set the parent node and render      
            let parents = new Map();
                parents.set( self.label, self );

            for ( let [ child, obj ] of map )
            {
                let path = obj.path;
                let index = path.findIndex( item => item == child );
                let prev = String( path[ index - 1 ] );
                let parent = parents.get( prev );

                if ( parent )
                {
                    let branch = parent.addBranch( { label: child, config: obj.config } );
                    parents.set( child, branch );

                    dnd.branch( i, branch.element, "UL", array, ( e, args ) => branch.changeParent( args ) );
  
                    i++;
                }
            }
        }
        
        tree( array ); 
    };

    function unroll( array )
    {
        let map = new Map();

        // create the path from array
        let a = [ ...array ];
            a.forEach( node => 
            { 
                let path = find( String( node.label ), [] );
                map.set( String( node.label ), { config: node.config, path: path.reverse() } );
            } );

        // find the parent
        function find( label, path )
        {
            path.push( label );
            
            let parent = array.find( node => String( node.label ) == label )?.parent;

            if ( parent )
                find( parent, path );

            return path;
        }
    
        return map;
    }
};

export default Component;