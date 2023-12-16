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
        const shrink = count * 2;
        const size = `${ orientations.size - shrink }%`;
        const div = document.createElement( "div" );
        this.element.appendChild( div );

        record.uuid = uuid;

        for ( let column in schema )
        {
            let config = schema[ column ];
            
            if ( config.display && record[ config.key ] )
            { 
                const opp = count - index;
                const min = `calc( ${ orientations.aspect }% + ${ ( 1 - orientations.aspect ) * 4 }px )`;

                let load = async ( index ) =>
                {      
                    let widget = await this.add.widget( { id: record[ config.key ], path: params.path, widget: config.widget, config: config, record: record } );
                        widget.set.source( config.source ? async () => await config.source() : () => t2.formats[ config.format ]( record[ config.key ] ) );
                        widget.add.css( "side" );
                        widget.add.css( "border" );
                        widget.add.css( "round" );
                        widget.set.element( div );

                        widget.element.style[ orientations.dimension ] = size;
                        widget.element.style[ orientations.start ] = `${ index * 2 * orientations.aspect }%`;
                        widget.element.style.zIndex = opp;

                        widget.set.config( "index", index );
                        widget.set.config( "min", min );
                        widget.set.config( "record", record );
                        widget.set.config( "shrink", shrink );
                        widget.set.config( "size", size );

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

    // widget specific
    let array;
    let fulfill;
    let index = 0;
    let previous = null;
    let schema;
    let orientations = {};

    this.render = async () =>
    {
        schema = this.get.schema();
    
        array = await this.get.data();

        if ( this.config.orientation )
        {
            switch( this.config.orientation )
            {
                case "horizontal":
                    orientations.aspect = 1;
                    orientations.dimension = "width";
                    orientations.size = 98;
                    orientations.start = "left";
                break;

                case "vertical":
                    orientations.aspect = 2;
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

    this.populate = async () =>
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

    const activate = ( e ) =>
    {
        let widget = e.detail.widget;
        let index = widget.config.index;
        let transition = `${ orientations.dimension } 1s ease-in-out`;

        this.children.forEach( child =>
        {
            let clicked = child == widget;
            let size = child == widget ? child.config.size : child.config.min;
            let z = index > child.config.index;

            if ( clicked )
            {
                child.element.style[ orientations.dimension ] = size;
                child.set.value();
                previous = child;
            }
            else if ( z )
            {
                child.element.innerHTML = null;
                child.element.style[ orientations.dimension ] = size;
                child.element.style.transition = transition;
            }
            else
            {
                child.element.style[ orientations.dimension ] = child.config.size;
                child.element.style.transition = transition;
            }

            child.set.config( "clicked", clicked );
        } ); 
    };
};

export default Accordion;