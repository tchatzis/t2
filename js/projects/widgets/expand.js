import Internals from "../widgets/widget.internals.js";

const Expand = function( params )
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

        const container = document.createElement( "div" );
            container.classList.add( orientations.class );
            container.classList.add( "collapsed" );
            container.classList.add( "grid" );
            container.style[ orientations.dimension ] = "100%";

        this.element.appendChild( container );

        for ( let column in schema )
        {
            let config = schema[ column ];
            
            if ( config.display && record[ config.key ] )
            { 
                let load = async ( index ) =>
                {      
                    let widget = await this.add.widget( { id: record[ config.key ], path: params.path, widget: config.widget, config: config, record: record } );
                        widget.set.datasource( config.source ? async () => await config.source() : () => t2.formats[ config.format ]( record[ config.key ] ) );
                        widget.add.css( "border" );

                        widget.set.element( container );
                        widget.element.style.padding = "1em";

                        widget.set.config( "index", index );
                        widget.set.config( "record", record );
                        widget.set.config( "size", widget.get.bbox()[ orientations.dimension ] );

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
        if ( this.config.orientation )
        {
            switch( this.config.orientation )
            {
                case "horizontal":
                    orientations.class = "wide";
                    orientations.dimension = "height"; 
                    orientations.property = "gridTemplateRows";
                break;                
                
                case "vertical":
                    orientations.class = "expand";
                    orientations.dimension = "width";   
                    orientations.property = "gridTemplateColumns";    
                break;
            }
        } 

        this.add.css( "fit" );
        this.add.css( "grid" );

        this.element.style[ orientations.property ] = columns().join( " " );
        this.element.style.maxHeight = "96%";

        await this.populate();

        this.event.receive( { channel: [ "activate", "select" ], source: this, handler: activate } );

        return this;
    };

    const activate = ( e ) =>
    {
        let widget = this.children.get( e.detail.value );
        let expand = columns();

        if ( !widget )
            return;

        if ( previous?.config.value !== widget.config.value )
        {
            expand[ widget.config.index ] = "auto";
            this.element.style[ orientations.property ] = expand.join( " " );
            this.set.config( "value", widget.config.value );

            widget.element.parentNode.classList.remove( "collapsed" );

            if ( previous )
                previous.element.parentNode.classList.add( "collapsed" );
        }

        previous = widget;
    };

    const columns = () =>
    {
        const count = this.get.count();
        const expand = [];
        
        for ( let i = 0; i < count; i++ )
        {
            expand.push( "0fr" );
        }

        return expand;
    };
};

export default Expand;