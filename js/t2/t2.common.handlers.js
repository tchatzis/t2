const Common = function()
{
    this.class = this.constructor.name;

    if ( !this.format )
        console.warn( this.id, this.format, this )

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

                    let type = await check( key, content, parent );
                        
                    if ( key == "datetime" )
                        parent.classList.add( key );
                    else
                        parent.classList.add( type );
                }
            }
        },

        path: function( index, value )
        {
            this.path[ index ] = value;
            this.element.textContent = this.path.join( "/" );
        },
    
        text: function( content )
        {
            this.element.textContent = content;
        }
    };

    async function check( key, content, parent )
    {
        let output = null;
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
                    let root = await t2.ui.root( parent );
  
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