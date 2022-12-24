import Handlers from "./t2.container.handlers.js";

const Container = function()
{
    function Container( element )
    {
        this.children = new Map();
        this.element = element;
        this.id = this.element.id;
        this.output = "html";
        this.path = new Map();
        this.type = "element"; 
    };

    this.addElement = async function( params )
    {
        let predicate = t2.ui.children.has( params.id );
        
        let element = t2.common.el( "div", params.parent );
            element.id = params.id;
        if ( params.ignore )
            element.setAttribute( "data-ignore", params.ignore );
        if ( params.css )
            element.classList.add( params.css );

        let rooted;

        if ( predicate )
        {
            let parent = document.getElementById( params.id );
            
            rooted = t2.ui.children.get( params.id );
            rooted.element = parent;

            for ( let [ id, component ] of rooted.children )
                parent.appendChild( component.element );
        }
        else
        {
            rooted = await this.root( element );
        }

        return rooted;
    };

    this.root = async function( element )
    {
        let container = new Container( element );

        container.path.set( container.id, [ container.id ] );
        container.format = getComputedStyle( element ).getPropertyValue( "display" );

        let path = container.path.get( container.id ).join( "." );

        t2.ui.children.set( path, container );
        container.children.set( container.id, container );

        Handlers.call( container );

        return container;
    };
};

export default Container;