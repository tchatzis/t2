import Internals from "../widgets/widget.internals.js";

const Panels = function( params )
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
        const count = this.get.count();

        for ( let column in schema )
        {
            let config = schema[ column ];
            
            if ( config.display && record[ config.key ] )
            { 
                const opp = count - index;

                let load = async ( index ) =>
                {      
                    let widget = await this.add.widget( { id: record[ config.key ], path: params.path, widget: config.widget, config: config, record: record } );
                        widget.set.datasource( config.source ? async () => await config.source() : () => t2.formats[ config.format ]( record[ config.key ] ) );
                        widget.add.css( "side" );
                        widget.add.css( "border" );
                        widget.add.css( "round" );
                        widget.add.css( "noclick" );

                        widget.element.style[ orientations.dimension ] = orientations.size;
                        widget.element.style[ orientations.start ] = 0;
                        widget.element.style.zIndex = opp;

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
    let orientations = {};

    this.render = async () =>
    {
        this.add.css( "fit" );
        this.element.style.position = "relative";

        if ( this.config.orientation )
        {
            switch( this.config.orientation )
            {
                case "horizontal":
                    orientations.dimension = "width";
                    orientations.size = 98;
                    orientations.start = "left";
                break;

                case "vertical":
                    orientations.dimension = "height"; 
                    orientations.size = 90;
                    orientations.start = "top";   
                break;
            }
        }   

        await this.populate();

        this.event.receive( { channel: [ "activate", "select" ], source: this, handler: activate } );

        return this;
    };

    const activate = ( e ) =>
    {
        let widget = this.children.get( e.detail.widget.value );

        if ( widget )
            widget.element.style.zIndex = this.get.count();

        if ( previous )
            previous.element.style.zIndex = 0;

        previous = widget;
    };
};

export default Panels;