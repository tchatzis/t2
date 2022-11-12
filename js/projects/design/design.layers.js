const Segment = function( params )
{
    Object.assign( this, params );

    this.data = new Map();

    this.addVector = function( vector )
    {
        this.data.set( vector, {} );
    };

    this.removeVector = function( vector )
    {
        this.data.delete( vector );
    };
};

const Layer = function( params )
{
    let self = this;
    let listeners = params.listeners || new Map();
    let ul = t2.common.el( "ul", params.element );

    this.children = new Map();
    this.config = params;
    this.name = params.name;
    this.segments = new Map();
    this.uuid = t2.common.uuid();

    this.init = function()
    {
        let link = t2.common.el( "div", ul );
            link.textContent = params.name;
            link.classList.add( "link" );
        for( let [ key, val ] of listeners )
        {
            link.addEventListener( val.type, ( e ) => val.handler( e, this ) );
        }

        this.element = link;
    };

    this.addLayer = function( params )
    {
        params.element = ul;
        params.listeners = listeners;
        
        let layer = new Layer( Object.assign( { ...this.config }, params ) );
            layer.parent = this;
            layer.parent.children.set( layer.name, layer );

        return layer;
    };

    this.addListener = function( listener )
    {
        listeners.set( listener.type, listener );
    };

    this.removeLayer = function()
    {
        //layers.delete( this.name );
    };

    this.addSegment = function( params )
    {
        params.layer = this.name;
        
        let segment = new Segment( params );
        
        this.segments.set( segment.name, segment );

        return segment;
    };

    this.removeSegment = function( params )
    {
        this.segments.delete( params.name );
    };
};

export default Layer;