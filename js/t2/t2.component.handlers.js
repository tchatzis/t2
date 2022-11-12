import Common from "./t2.common.handlers.js";

const Handlers = function()
{
    const path = [];
    
    this.set = function()
    {
        if ( !this.output )
        {
            console.error( this.id, "output is not defined in component paramaters" );
            return;
        }

        format[ this.output ].call( this, ...arguments );
    };

    this.unset = function( index )
    {
        path.splice( index, 1 );
        this.element.textContent = path.join( "/" );
    };

    const format =
    {
        fragment: function( content )
        {
            this.element.appendChild( content );
        },        
        
        html: function( content )
        {
            this.element.innerHTML = content;
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
            path[ index ] = value;
            this.element.textContent = path.join( "/" );
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

    this.element.setAttribute( "data-format", this.format || "" );

    this.hide = () => this.element.classList.add( "hidden" );

    this.remove = () => this.element.remove();

    this.show = () => this.element.classList.remove( "hidden" );

    Common.call( this );
};

export default Handlers;