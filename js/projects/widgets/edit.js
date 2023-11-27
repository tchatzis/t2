import Internals from "./widget.internals.js";

const Edit = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // widget specific
    let text;

    this.set.config( "primitive", true );

    this.render = async () =>
    {
        text = await this.refresh();
        
        // used to provide formatting in table
        let ghost = document.createElement( "div" );
            ghost.style.visibility = "hidden";
            ghost.textContent = text;

        this.element.parentNode.appendChild( ghost );
        this.element.setAttribute( "contenteditable", "" );
        this.element.classList.add( "editable" );

        this.populate();

        return this;
    };

    this.populate = () =>
    {
        this.element.textContent = text;
    };

    this.handlers = () =>
    {
        let allowed = false;
        let type = new params.config.type();

        const validate =
        {
            content: ( e ) =>
            {   
                allowed = this.validate[ type.constructor.name ].content( this.element.textContent );
    
                if ( !allowed )
                {
                    e.preventDefault();
    
                    this.element.textContent = text;
                }
    
                if ( this.element.textContent === text )
                    this.element.classList.remove( "dirty" );
                else
                    this.element.classList.add( "dirty" );
            },
            key: ( e ) =>
            {
                allowed = this.validate[ type.constructor.name ].key( e.key );
    
                if ( !allowed )
                    e.preventDefault();
            
                this.element.classList.add( "dirty" );
            },
            revert: ( e ) =>
            {
                e.preventDefault();
    
                this.element.textContent = text;
                this.element.blur();
                this.element.classList.remove( "dirty" );
            }
        };

        // test key
        this.element.addEventListener( params.config.validate.key, validate.key );
        // test content
        this.element.addEventListener( params.config.validate.content, validate.content );  
        // revert on double click
        this.element.addEventListener( "dblclick", validate.revert );
    };
};

export default Edit;