import Internals from "../widgets/widget.internals.js";

const Buttons = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // extend externals
    this.add.button = async ( record ) =>
    {
        const uuid = t2.common.uuid();
        const button = document.createElement( "div" );
        this.element.appendChild( button );

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
                        widget.set.element( button );
                        widget.add.css( "button" );
                    
                    if ( record[ config.key ] == this.config.record[ config.key ] )
                    {
                        widget.add.css( "active" ); 
                        previous = widget;
                    }

                    config.classes.forEach( cls => widget.add.css( cls ) );

                    return widget;
                };

                fulfill.add( load() );
            }
        }
    };

    this.handlers.click = ( args ) => this.event.send( { channel: args.channel || "select", widget: args.widget } );

    this.set.active = ( widget ) => this.handlers.click( { channel: "activate", widget: widget } );
    this.set.inactive = ( widget ) => this.deactivate( { detail: { widget: widget } } );

    this.set.enabled = ( widget ) => this.enable( { detail: { widget: widget } } );
    this.set.disabled = ( widget ) => this.disable( { detail: { widget: widget } } );

    // widget specific
    let array;
    let fulfill;
    let previous = null;
    let schema;
    
    this.render = async () =>
    {
        //this.config.orientation
        
        schema = this.get.schema();
    
        array = await this.refresh();
        this.set.data( array );

        if ( this.config.orientation )
            this.add.css( this.config.orientation );

        await this.populate();

        this.event.receive( { channel: [ "activate", "select" ], source: this, handler: this.activate } );

        return this;
    };

    this.populate = async function()
    {
        fulfill = new t2.common.Fulfill();

        if ( this.config.sort )
            array = this.get.copy().sort( this.sort[ this.config.sort.direction ] );
            array.forEach( record => this.add.button( record ) );

        const completed = new t2.common.Fulfill();

        let widgets = await fulfill.resolve();
            widgets.forEach( widget => completed.add( widget.render() ) );

        const rendered = await completed.resolve();
            rendered.forEach( ( widget, index ) => completed.add( widget.add.handler( { event: "click", handler: this.handlers.click, record: array[ index ] } ) ) );
    };

    this.activate = ( e ) =>
    {
        let widget = e.detail.widget;
            widget.add.css( "active" );

        this.set.inactive( previous );

        previous = widget;
    };

    this.deactivate = ( e ) =>
    {
        let widget = e.detail.widget;
            widget?.remove.css( "active" );
    };

    this.enable = ( e ) =>
    {
        let widget = e.detail.widget;
            widget.remove.css( "disabled" );
    };

    this.disable = ( e ) =>
    {
        let widget = e.detail.widget;
            widget.add.css( "disabled" );
    };
};

export default Buttons;