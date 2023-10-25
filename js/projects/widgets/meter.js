import Common from "../widgets/common.js";

const Meter = function( params )
{ 
    let previous = null;
    let calculations = {};
    let orientations = {};
    let box;
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

        box = await t2.widget.create( { id: "box", type: "box" } );
        box.css.add( "meter" );
        box.css.add( "m10" );
        box.css.add( "border" );
        box.css.add( "r4" );

        if ( this.display?.config?.size )
        {
            for ( let prop in this.display?.config?.size )
                box.element.style[ prop ] =  this.display.config.size[ prop ];
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

        handle = await t2.widget.create( { id: "handle", type: "box" } );
        handle.css.add( "handle" );
        handle.css.add( "r4" );
        handle.element.addEventListener( "mousedown", this.handlers.mousedown ); 

        box.action.add( handle );
        this.action.add( box );

        let value = this.display.config.label.value;
        const bbox = box.dom.dimensions();

        this.data.array = this.data.raw.map( record => Number( record[ value ] ) );

        calculations.count = this.data.count();
        calculations.min = Math.min.apply( null, this.data.array );
        calculations.max = Math.max.apply( null, this.data.array );
        calculations.sum = this.data.array.reduce( ( a, b ) => a + b );
        calculations.range = calculations.max - calculations.min;
        calculations.average = calculations.sum / calculations.count;
        calculations.mid = calculations.range / 2;
        calculations.height = Math.round( bbox.height - 2 );
        calculations.width = Math.round( bbox.width - 2 );
        calculations.track = calculations[ orientations.dimension ] - handle.element[ `offset${ t2.formats.capitalize( orientations.dimension ) }` ];
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
                calculations.offset = Math.round( handle.element.offsetLeft ) + e[ `movement${ orientations.axis }` ];
                calculations.offset = Math.max( 0, calculations.offset );
                calculations.offset = Math.min( calculations.offset, calculations.track );
                calculations.normalized = calculations.offset / calculations.track;
                calculations.value = calculations.normalized * calculations.range + calculations.min;

                handle.element.style[ orientations.direction ] = calculations.offset + "px";
                handle.element.style.cursor = orientations.cursor;
            }
        },
        mouseup: ( e ) => 
        {
            this.listening = false;
            handle.css.remove( "move" );
            window.removeEventListener( "mousedown", this.handlers.listen );
            window.addEventListener( "mouseup", this.handlers.mouseup );
            window.removeEventListener( "mousemove", this.handlers.mousemove );
            console.warn( calculations )
        }
    };
};

export default Meter;