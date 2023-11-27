import Internals from "../widgets/widget.internals.js";

const Carousel = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // extend externals
    this.add.panel = ( record ) =>
    {
        const uuid = t2.common.uuid();

        record.uuid = uuid;

        for ( let column in schema )
        {
            let config = schema[ column ];
                config.display = !!config.primaryKey;

            if ( config.display )
            {
                let load = async () =>
                {      
                    let widget = await this.add.widget( { id: record[ config.key ], path: params.path, widget: config.widget, config: config, record: record } );
                        widget.set.source( () => t2.formats[ config.format ]( record[ config.key ] ) );
                        widget.set.config( "record", record );
                        widget.set.element( carousel );
                        widget.add.css( "center" );
                        widget.add.css( "side" );
                        widget.add.css( "border" );
                        widget.add.css( "round" );
                        widget.element.style.transform = `${ orientations.rotate }( ${ calculations.angle * index }deg ) ${ orientations.translate }( ${ calculations.radius }px )`;

                    config.classes.forEach( cls => widget.add.css( cls ) );

                    index++;

                    return widget;
                };

                fulfill.add( load() );
            }
        }
    };

    this.handlers.rotate = ( e ) =>
    {  
        let keys = Array.from( this.children.keys() );
        let index = keys.indexOf( e.detail.value );
        
        carousel.style.transform = `${ orientations.translate }( ${ -calculations.radius }px ) ${ orientations.rotate }( ${ -calculations.angle * index }deg )`;
    };

    // widget specific
    let array;
    let fulfill;
    let index = 0;
    let previous = null;
    let schema;
    let carousel; 
    let calculations = {};
    let orientations = {};

    this.set.config( "readonly", true );

    this.render = async () =>
    {
        schema = this.get.schema();
        
        array = await this.refresh();
        this.set.data( array );

        this.add.css( "fit" );

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
    };

    this.populate = async () =>
    {
        fulfill = new t2.common.Fulfill();

        if ( this.config.sort )
            array = this.get.copy().sort( this.sort[ this.config.sort.direction ] );
            array.forEach( record => this.add.panel( record ) );

        const completed = new t2.common.Fulfill();

        let widgets = await fulfill.resolve();
            widgets.forEach( widget => completed.add( widget.render() ) );

        //const rendered = await completed.resolve();
        //    rendered.forEach( ( widget, index ) => completed.add( widget.add.handler( { event: "click", handler: this.handlers.click, record: array[ index ] } ) ) );
    };
};

export default Carousel;
