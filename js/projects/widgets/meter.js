import Common from "../widgets/common.js";

const Meter = function( params )
{ 
    let previous = null;
    let calculations = {};
    let orientations = {};
    let types = {};
    let track;
    let handle;
    
    this.listening = false;

    this.element = document.createElement( "div" );
    
    this.params = params;
    this.params.class = this.constructor.name;

    // common
    Common.call( this );

    Object.defineProperty( this.data, "output", { value: true, writeable: false } );

    this.init = async () =>
    {
        await this.data.refresh();

        track = await t2.widget.create( { id: "track", type: "box" } );
        track.css.add( "meter" );
        track.css.add( "m10" );
        track.css.add( "border" );
        track.css.add( "r4" );

        if ( this.display?.config?.size )
        {
            for ( let prop in this.display?.config?.size )
                track.element.style[ prop ] =  this.display.config.size[ prop ];
        }

        if ( this.display?.config.orientation )
        {
            switch( this.display.config.orientation )
            {
                case "horizontal":
                    orientations.axis = "X";
                    orientations.cursor = "ew-resize";
                    orientations.dimension = "width";
                    orientations.direction = "left"   
                break;

                case "vertical":
                    orientations.axis = "Y";
                    orientations.cursor = "ns-resize";
                    orientations.dimension = "height";    
                    orientations.direction = "top";   
                break;
            }
        }  

        if ( this.display?.config.type )
        {
            types.config = this.display.config.type;
            
            switch( types.config )
            {
                case "bar":
                    types.offset = "dimension";
                    types.track = "direction";
                break;
                
                default: 
                    typse.offset = "direction";
                    types.track = "dimension";  
                break;
            }
        }


        handle = await t2.widget.create( { id: "handle", type: "box" } );
        handle.css.add( "handle" );
        handle.css.add( "r4" );
        handle.element.addEventListener( "mousedown", this.handlers.mousedown ); 

        track.action.add( handle );
        this.action.add( track );

        let value = this.display.config.label.value;
        const btrack = track.dom.dimensions();

        this.data.array = this.data.raw.map( record => Number( record[ value ] ) );

        calculations.count = this.data.count();
        calculations.min = Math.min.apply( null, this.data.array );
        calculations.max = Math.max.apply( null, this.data.array );
        calculations.sum = this.data.array.reduce( ( a, b ) => a + b );
        calculations.range = calculations.max - calculations.min;
        calculations.average = calculations.sum / calculations.count;
        calculations.mid = calculations.range / 2;
        calculations.height = Math.round( btrack.height - 2 );
        calculations.width = Math.round( btrack.width - 2 );
        calculations.track = calculations[ orientations.dimension ] - handle.element[ `offset${ t2.formats.capitalize( orientations[ types.track ] ) }` ];
    };

    this.handlers =
    {
        listen: () => this.listening = true,
        mousedown: ( e ) => 
        {
            window.addEventListener( "mousedown", this.handlers.listen );
            window.addEventListener( "mouseup", this.handlers.mouseup );
            window.addEventListener( "mousemove", this.handlers.mousemove );
        },
        mousemove: ( e ) => 
        {
            if ( this.listening )
            {
                calculations.offset = Math.round( handle.element[ `offset${ t2.formats.capitalize( orientations[ types.offset ] ) }` ] ) + e[ `movement${ orientations.axis }` ];
                calculations.offset = Math.max( 0, calculations.offset );
                calculations.offset = Math.min( calculations.offset, calculations.track );
                calculations.normalized = calculations.offset / calculations.track;
                calculations.value = calculations.normalized * calculations.range + calculations.min;

                switch( types.config )
                {
                    case "bar":
                        handle.element.style[ orientations[ types.track ] ] = 0;
                    break;
                }
                
                handle.css.add( "move" );
                handle.element.style.cursor = orientations.cursor;
                handle.element.style[ orientations[ types.offset ] ] = calculations.offset + "px";
            }
        },
        mouseup: ( e ) => 
        {
            this.listening = false;

            handle.css.remove( "move" );
            handle.element.style.cursor = "auto";

            window.removeEventListener( "mousedown", this.handlers.listen );
            window.removeEventListener( "mouseup", this.handlers.mouseup );
            window.removeEventListener( "mousemove", this.handlers.mousemove );
        }
    };
};

export default Meter;