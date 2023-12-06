import Internals from "../widgets/widget.internals.js";

const Menu = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // extend externals
    this.add.link = async ( record ) =>
    {
        const uuid = t2.common.uuid();
        const link = document.createElement( "div" );
        this.element.appendChild( link );

        record.uuid = uuid;

        for ( let column in schema )
        {
            const group = document.createElement( "div" );
            link.appendChild( group );
            
            let config = schema[ column ];
            let value = record[ config.key ];// || record.key
            console.log( config.key, record.key )

            if ( config.display )
            {
                let load = async ( index ) =>
                {      
                    let output = ~[ "icon", "image", "html", "text" ].indexOf( config.widget ) ? config.widget : "text";

                    let widget = await this.add.widget( { id: `${ column }.${ index }`, path: params.path, widget: output, config: config, record: record } );
                        widget.set.source( () => t2.formats[ config.format ]( value ) );
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
    this.set.inactive = ( widget ) => this.deactivate( { detail: { widget: widget } } );

    this.set.enabled = ( widget ) => this.enable( { detail: { widget: widget } } );
    this.set.disabled = ( widget ) => this.disable( { detail: { widget: widget } } );

    // widget specific
    let array;
    let fulfill;
    let index = 0;
    let previous = null;
    let schema;
    
    this.render = async () =>
    {
        schema = this.get.schema();
    
        array = await this.get.data();

        if ( this.config.orientation )
        {
            this.add.css( this.config.orientation );
        }

        await this.populate();

        this.event.receive( { channel: [ "activate", "select" ], source: this, handler: this.activate } );

        return this;
    };

    this.populate = async function()
    {
        fulfill = new t2.common.Fulfill();

        if ( this.config.sort )
            array = this.get.copy().sort( this.sort[ this.config.sort.direction ] );
            array.forEach( record => this.add.link( record ) );

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

export default Menu;