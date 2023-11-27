import Internals from  "../widgets/widget.internals.js";

const Element = function( params )
{
    this.element = params.element;
};

const Convert = function( params )
{
    if ( params.parent )
    {
        if ( !params.parent.params )
        {
            this.parent = params.parent;
            this.element = params.parent.element;
            this.children = params.parent.children;

            params.class = params.parent.class;
            params.id = params.parent.id || this.element.id || t2.common.uuid();
            params.path = params.parent.path.get( params.id );
        }

        if ( !this.element )
            throw( "Either { parent: Widget } or { element: HTMLTag } must be defined" );
        
        Internals.call( this, params );
    
        return this;
    }

    if ( params.element )
    {
        this.parent = new Element( params );
        this.element = this.parent.element;
        this.children = this.parent.children;
        
        params.class = this.parent.constructor.name;
        params.id = params.element.id || t2.common.uuid();
        params.path = [ params.id ]; 

        Internals.call( this, params );

        return this;
    }
};

export default Convert;