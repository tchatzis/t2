import Internals from "../widgets/widget.internals.js";

const Carousel = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // extend externals
    this.add.item = ( args ) =>
    {
        const uuid = t2.common.uuid();
        const schema = args.schema;
        const fulfill = args.fulfill;
        const record = args.record;
            record.uuid = uuid;

        for ( let column in schema )
        {
            let config = schema[ column ];

            if ( config.display && record[ config.key ] )
            {
                let load = async ( index ) =>
                {      
                    let widget = await this.add.widget( { id: record[ config.key ], path: params.path, widget: config.widget, config: config, record: record } );
                        widget.set.datasource( config.source ? async () => await config.source() : () => t2.formats[ config.format ]( record[ config.key ] ) );
                        widget.set.element( carousel );
                        widget.add.css( "center" );
                        widget.add.css( "side" );
                        widget.add.css( "translucent" );
                        widget.add.css( "border" );
                        widget.add.css( "round" );
                    if ( !index )
                    {
                        widget.add.css( "noclick" );
                        previous = widget;
                    }
                        widget.element.style.transform = `${ orientations.rotate }( ${ calculations.angle * index }deg ) ${ orientations.translate }( ${ calculations.radius }px )`;

                        widget.set.config( "index", index );
                        widget.set.config( "record", record );

                    config.classes.forEach( cls => widget.add.css( cls ) );

                    return widget;
                };

                fulfill.add( load( index ) );

                index++;
            }
        }
    };

    this.handlers.click = ( args ) => this.event.send( { channel: args.channel || "select", widget: args.widget } );

    this.set.active = ( e ) => this.handlers.click( { channel: "activate", widget: e.detail.widget } );

    // widget specific
    let index = 0;
    let previous = null;
    let calculations = {};
    let orientations = {};
    let carousel;

    this.render = async () =>
    {
        this.add.css( "fit" );
        this.element.style.position = "relative";

        carousel = document.createElement( "div" );
        carousel.classList.add( "carousel" );
        this.element.appendChild( carousel );

        if ( this.config.orientation )
        {
            switch( this.config.orientation )
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

        calculations.count = this.get.count();
        calculations.angle = 360 / calculations.count;
        calculations.bbox = this.get.bbox();
        calculations.radius = Math.round( ( calculations.bbox[ orientations.dimension ] / 2 ) / Math.tan( Math.PI / calculations.count ) );
        calculations.perspective = calculations.bbox[ orientations.dimension ] + "px";

        this.element.style.perspective = calculations.perspective;
        carousel.style.transform = `${ orientations.translate }( ${ -calculations.radius }px )`;
    
        await this.populate();

        this.event.receive( { channel: [ "activate", "select" ], source: this, handler: activate } );

        return this;
    };

    const activate = ( e ) =>
    {
        let keys = this.get.data().map( record => record[ record.key ] );
        let index = keys.indexOf( e.detail.value );
        let widget = e.detail.widget;
            widget.add.css( "noclick" );

        this.set.config( "value", widget.config.value );

        previous?.remove.css( "noclick" );
        previous = widget;
        
        carousel.style.transform = `${ orientations.translate }( ${ -calculations.radius }px ) ${ orientations.rotate }( ${ -calculations.angle * index }deg )`;
    };
};

export default Carousel;
