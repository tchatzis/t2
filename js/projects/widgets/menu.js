import Internals from "../widgets/widget.internals.js";

const Menu = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // extend externals
    this.add.item = async ( args ) =>
    {
        const uuid = t2.common.uuid();
        const schema = args.schema;
        const fulfill = args.fulfill;
        const record = args.record;
            record.uuid = uuid;

        const link = document.createElement( "div" );
        this.element.appendChild( link );

        for ( let column in schema )
        {
            const group = document.createElement( "div" );
            link.appendChild( group );
            
            let config = schema[ column ];
            let value = record[ config.key ];

            if ( config.display )
            {
                let load = async ( index ) =>
                {      
                    let output = ~[ "icon", "image", "html", "text" ].indexOf( config.widget ) ? config.widget : "text";

                    let widget = await this.add.widget( { id: `${ column }.${ index }`, path: params.path, widget: output, config: config, record: record } );
                        widget.set.datasource( () => t2.formats[ config.format ]( value ) );
                        widget.set.config( "record", record );
                        widget.set.element( group );

                        widget.set.config( "index", index );
                        widget.set.config( "primitive", true );
                        widget.add.css( "link" );
                        widget.remove.css( "none" );

                    config.classes.forEach( cls => widget.add.css( cls ) );

                    return widget;
                };

                fulfill.add( load( index ) );

                index++;
            }
        }
    };

    this.handlers.click = ( args ) => this.event.send( { channel: args.channel || "select", widget: args.widget } );

    this.set.active = ( widget ) => this.handlers.click( { channel: "activate", widget: widget } );
    this.set.inactive = ( widget ) => this.handlers.click( { channel: "deactivate", widget: widget } );

    this.set.enabled = ( widget ) => this.handlers.click( { channel: "enable", widget: widget } );
    this.set.disabled = ( widget ) => this.handlers.click( { channel: "disable", widget: widget } );

    // widget specific
    let index = 0;
    let previous = null;
    
    this.render = async () =>
    {
        if ( this.config.orientation )
        {
            this.add.css( this.config.orientation );
        }

        await this.populate();

        this.event.receive( { channel: [ "activate", "select" ], source: this, handler: activate } );
        this.event.receive( { channel: [ "deactivate" ], source: this, handler: deactivate } );
        this.event.receive( { channel: [ "enable" ], source: this, handler: enable } );
        this.event.receive( { channel: [ "disable" ], source: this, handler: disable } );

        return this;
    };

    const activate = ( e ) =>
    {
        let widget = e.detail.widget;
            widget.add.css( "active" );

        e.detail.widget = previous;

        deactivate( e );

        e.detail.widget = widget;

        previous = widget;
    };

    const deactivate = ( e ) =>
    {
        let widget = e.detail.widget;
            widget?.remove.css( "active" );
    };

    const enable = ( e ) =>
    {
        let widget = e.detail.widget;
            widget?.remove.css( "disabled" );
    };

    const disable = ( e ) =>
    {
        let widget = e.detail.widget;
            widget?.add.css( "disabled" );
    };
};

export default Menu;