import Container from "./t2.ui.container.element.js";

const Common = function()
{
    let self = this;
    
    this.adopt = function( object, params )
    {
        let path = object.path.get( params.id ).join( "." );

        t2.ui.children.set( path, object );

        this.children.set( params.id, object );

        Object.assign( object, params );
    };

    this.attach = function( component )
    {
        component.element.appendChild( this.element );
    };

    this.class = this.constructor.name;

    if ( !this.format )
        console.error( "Format is not defined in", "id:", this.id, "format:", this.format, "object:", this )

    this.element.classList.add( this.format );
    this.element.setAttribute( "data-id", this.id );
    this.element.setAttribute( "data-type", this.type );
    this.element.setAttribute( "data-class", this.class );
    this.element.setAttribute( "data-path", this.path.get( this.id ).join( "." ) );
    
    this.hide = () => this.element.classList.add( "hidden" );

    this.loading = function()
    {
        let loading = new Image();
            loading.src = "/images/loading.gif";
            loading.style.width = "50%";

        this.element.appendChild( loading );

        return loading;
    };

    this.remove = () => this.element.remove();

    this.show = () => this.element.classList.remove( "hidden" );   

    this.scale = () => 
    {
        const scale = () => 
        {
            for ( let [ name, component ] of this.parent.children )
                if ( component !== this )
                    component.element.classList.add( "scaled" );
        };
        
        this.element.classList.add( "scaled" );

        this.element.addEventListener( "click", ( e ) => 
        {
            e.stopPropagation();

            this.element.classList.toggle( "scaled" ); 

            if ( this.element.classList.contains( "scaled" ) )
                this.element.style.position = "relative";
            else
                this.element.style.position = "absolute";

            scale();  
        } );
    };

    this.set = function()
    { 
        if ( !this.output )
        {
            console.error( this.id, "output is not defined in paramaters" );
            return;
        }

        format[ this.output ].call( this, ...arguments );
    };

    this.unscale = () => 
    {
        this.element.style.position = "absolute";
        this.element.classList.remove( "scaled" );
    };

    const format =
    {
        fragment: function( content )
        {
            this.element.appendChild( content );
        },        
        
        html: function( content )
        {
            this.element.appendChild( content );
        },

        object: async function( content, root )
        {
            for ( let key in content )
            {
                if ( content.hasOwnProperty( key ) )
                {
                    let row = t2.common.el( "div", root || this.element );
                        row.classList.add( "flex-left" );
                        row.classList.add( "underline" );

                    let label = t2.common.el( "label", row );
                        label.textContent = key;

                    let parent = t2.common.el( "div", row );
                        parent.id = key;
                        parent.classList.add( "field" );

                    let type = await check.call( this, key, content, parent );
                        
                    if ( key == "datetime" )
                        parent.classList.add( key );
                    else
                        parent.classList.add( type );
                }
            }
        },

        path: function( index, value )
        {
            this.array[ index ] = value;
            this.array = this.array.slice( 0, index + 1 );
            this.element.textContent = this.array.join( "/" );
        },
    
        text: function( content )
        {
            this.element.textContent = content;
        }
    };

    async function check( key, content, parent )
    {
        let value = content[ key ];
        let type = typeof value;

        switch ( type )
        {
            case "object":
                if ( Array.isArray( value ) )
                {
                    parent.textContent = `[ ${ value.length } ]`;
                    type = "array";
                }
                else
                {
                    let container = new Container();
                    let root = await container.root( parent );
                    let tuple = await root.addComponent( { id: key, type: "tuple", format: "block", output: "object" } );
                        tuple.set( value );
                }
            break;
 
            case "number":
            case "string":
                parent.textContent = value;
            break;
        }

        return type;
    }
};

export default Common;