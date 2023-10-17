import Common from "../widgets/common.js";

const Carousel = function( params )
{ 
    let previous = null;
    let calculations = {};
    let orientations = {};
    let box;
    
    this.element = document.createElement( "div" );
    
    this.params = params;
    this.params.class = this.constructor.name;

    // common
    Common.call( this );

    Object.defineProperty( this.data, "output", { value: true, writeable: false } );

    this.init = async () =>
    {
        await this.data.refresh();

        this.css.add( "perspective" );
        this.css.add( "fit" );

        box = await t2.widget.invoke( { id: "box", type: "box" } );
        box.css.add( "carousel" );
 
        if ( this.display?.config.orientation )
        {
            switch( this.display.config.orientation )
            {
                case "horizontal":
                    orientations.dimension = "width";
                    orientations.rotate = "rotateY";
                    orientations.translate = "translateZ";
                break;

                case "vertical":
                    orientations.dimension = "height";    
                    orientations.rotate = "rotateX";
                    orientations.translate = "translateZ";
                break;
            }
        }       

        calculations.count = this.data.count();
        calculations.angle = 360 / calculations.count;
        calculations.bbox = this.dom.dimensions();
        calculations.radius = Math.round( ( calculations.bbox[ orientations.dimension ] / 2 ) / Math.tan( Math.PI / calculations.count ) );
        calculations.perspective = calculations.bbox[ orientations.dimension ] + "px";

        this.action.add( box );

        await this.data.populate( async ( record, index ) => 
        {
            let panel = await t2.widget.invoke( { id: index, type: "box" } );
                panel.css.add( "side" );
                panel.css.add( "border" );
                panel.css.add( "round" );
                panel.content.add( index );
                panel.data.define( record );
                panel.element.style.transform = `${ orientations.rotate }( ${ calculations.angle * index }deg ) ${ orientations.translate }( ${ calculations.radius }px )`;

            box.action.init( { widget: panel, parent: box } );

            return panel;
        } );

        this.element.style.perspective = calculations.perspective;
        this.children = box.children;

        box.element.style.transform = `${ orientations.translate }( ${ -calculations.radius }px )`;
    };

    this.handlers.rotate = ( packet ) =>
    {  
        const widget = packet.widget;
        
        if ( previous == widget )
            return;

        if ( previous )
        {
            previous.css.remove( "selected" );
            previous.event.state = false;
        }

        let copy = new this.event.Packet( packet );
            copy.broadcaster = this;
            copy.type = "selected";
            copy.widget = this.children.get( packet.index );
            copy.widget.css.add( "selected" );
            copy.widget.event.state = true;

        previous = copy.widget;
        
        box.element.style.transform = `${ orientations.translate }( ${ -calculations.radius }px ) ${ orientations.rotate }( ${ -calculations.angle * copy.index }deg )`;

        this.event.broadcaster.add( { type: copy.type, packet: copy } );
        this.event.broadcaster.dispatch( { type: copy.type, packet: copy } );
    };
};

export default Carousel;
