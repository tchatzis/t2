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

    this.scale = ( amount ) => 
    {
        let a = amount || 0.5;
            a = a >= 1 ? 1 : a;
            a = a < 0 ? 0 : a;
            a = a == 1 ? 0 : a;
        
        const scale = () => 
        {   
            for ( let [ name, component ] of this.parent.children )
                if ( component !== this && a )
                    component.element.classList.add( "scaled" );
        };

        if ( a )
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
        code: function( content )
        {
            this.element.classList.add( "pre" );
            this.element.textContent = content;
        },

        data: function( content )
        {
            console.error( content );
            
            //this.element.appendChild( content );
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
        console.error( key, content, parent );
        
        let value = content[ key ];
        let type = typeof value;

        function array()
        {
            let string = [ `[ ${ value.toString().replace( /,/g, ", " ) } ]`, `[ ${ value.length } ]` ];
                    
            if ( value.length > 16 )
            {
                let index = 1;
                
                parent.textContent = string[ index ];
                parent.addEventListener( "click", function()
                {
                    index = 1 - index;

                    parent.textContent = string[ index ]; 
                    parent.classList.toggle( "field" );
                }, false );
            }
            else
            {
                parent.textContent = string[ 0 ];
            }

            type = "array";
        }

        switch ( type )
        {
            case "object":
                if ( Array.isArray( value ) )
                    array();
                else
                {
                    let prototype = Object.prototype.toString.call( value ).slice( 8, -1 );
                    let subtype = prototype;
                        subtype = subtype.includes( "Element" ) ? "Element" : subtype;
                        subtype = subtype.includes( "Array" ) ? "Array" : subtype;

                    switch( subtype )
                    {
                        case "Element":
                            parent.textContent = `< ${ prototype } >`;
                            parent.style.color = "blue";
                        break;
                        
                        case "Array":
                            array();
                        break;

                        case "Map":
                            parent.textContent = `Map( ${ [ ...value.keys() ] } )`;
                            parent.style.color = "fuchsia";
                        break;

                        case "Object":
                            let container = new Container();
                            let root = await container.root( parent );
                            let tuple = await root.addComponent( { id: key, type: "tuple", format: "block", output: "object" } );
                                tuple.set( value );
                        break;

                        default:
                            parent.textContent = `{ ${ subtype } }`
                        break;
                    }
                }
            break;

            case "function":
                let f = value.toString();
                let exp = /\((.*?)\)/;
                let args = f.match( exp )[ 1 ];
                let string = [ f, `f(${ args})` ];
                let index = 1;
                        
                parent.textContent = string[ index ];
                parent.addEventListener( "click", function()
                {
                    index = 1 - index;

                    parent.textContent = string[ index ]; 
                    parent.classList.toggle( "field" );
                }, false );
            break;
 
            case "boolean":
            case "number":
            case "string":
                parent.textContent = value;
            break;

            default:
                parent.textContent = type;
                parent.style.color = "red";
            break;
        }

        return type;
    }
};

export default Common;