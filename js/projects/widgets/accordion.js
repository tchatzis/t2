import Internals from "../widgets/widget.internals.js";

const Accordion = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // extend externals
    this.add.panel = ( record ) =>
    {
        const uuid = t2.common.uuid();
        const count = this.get.count();
        const size = 98 - count;
        const div = document.createElement( "div" );
        this.element.appendChild( div );

        record.uuid = uuid;

        for ( let column in schema )
        {
            let config = schema[ column ];
            
            if ( config.display && record[ config.key ] )
            { 
                const shrink = ( count - index ) * 2;
                
                let load = async ( index ) =>
                {      
                    let widget = await this.add.widget( { id: record[ config.key ], path: params.path, widget: config.widget, config: config, record: record } );
                        widget.set.source( () => t2.formats[ config.format ]( record[ config.key ] ) );
                        widget.set.config( "record", record );
                        widget.add.css( "side" );
                        widget.add.css( "border" );
                        widget.add.css( "round" );
                        widget.set.element( div );
                        widget.element.style[ "width" ] = `${ size - shrink }%`;
                        widget.element.style[ "right" ] = `${ shrink }%`;
                        widget.element.style.zIndex = index;
                        widget.set.config( "index", index );
                        widget.set.config( "shrink", shrink );
                        widget.set.config( "width", size - shrink );

                    config.classes.forEach( cls => widget.add.css( cls ) );

                    return widget;
                };

                fulfill.add( load( count - index ) );

                index++;
            }
        }
    };

    this.handlers.click = ( args ) => this.event.send( { channel: args.channel || "select", widget: args.widget } );

    // widget specific
    let array;
    let fulfill;
    let index = 0;
    let previous = null;
    let schema;

    this.render = async () =>
    {
        this.set.from.columns();
        
        schema = this.get.schema();
    
        array = await this.refresh();
        this.set.data( array );

        await this.populate();

        this.event.receive( { channel: [ "activate", "select" ], source: this, handler: this.activate } );

        return this;
    };

    this.populate = async function()
    {
        fulfill = new t2.common.Fulfill();

        if ( this.config.sort )
            array = this.get.copy().sort( this.sort[ this.config.sort.direction ] );
            array.forEach( record => this.add.panel( record ) );

        const completed = new t2.common.Fulfill();

        let widgets = await fulfill.resolve();
            widgets.forEach( widget => completed.add( widget.render() ) );

        const rendered = await completed.resolve();
            rendered.forEach( ( widget, index ) => completed.add( widget.add.handler( { event: "click", handler: this.handlers.click, record: array[ index ] } ) ) );
    };

    this.activate = ( e ) =>
    {
        let widget = e.detail.widget;
        let index = widget.config.index;
        
        this.children.forEach( child =>
        {
            let clicked = child == widget;
            let width = child == widget ? `${ child.config.width }%` : `${ child.config.shrink }%`;

            if ( clicked )
            {
                child.element.style[ "width" ] = width;
                previous = child;
            }

            if ( child.config.index > index )
            {
                child.element.style[ "width" ] = width;
                child.element.style.transition = "width 1s ease-in-out";
            }

            child.set.config( "clicked", clicked );
        } );
    };
};

export default Accordion;