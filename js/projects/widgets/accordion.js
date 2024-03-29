import Internals from "../widgets/widget.internals.js";

const Accordion = function( params )
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
        const shrink = count * 5 / orientations.aspect;
        const size = `${ ( orientations.size - shrink ) }%`;

        const div = document.createElement( "div" );
            div.style.position = "absolute";  
            div.classList.add( "fit" ); 
        this.element.appendChild( div );

        for ( let column in schema )
        {
            let config = schema[ column ];
            
            if ( config.display && record[ config.key ] )
            { 
                const opp = count - index;
                const min = `calc( ${ orientations.aspect }% + ${ ( 1 - orientations.aspect ) * 4 }px )`;
                const start = `${ index * 2 }em`;

                div.style[ orientations.start ] = start;

                let load = async ( index ) =>
                {      
                    let widget = await this.add.widget( { id: record[ config.key ], path: params.path, widget: config.widget, config: config, record: record } );
                        widget.set.datasource( config.source ? async () => await config.source() : () => t2.formats[ config.format ]( record[ config.key ] ) );
                        widget.add.css( "side" );
                        widget.add.css( "border" );
                        widget.add.css( "round" );
                        widget.set.element( div );

                        widget.element.style[ orientations.dimension ] = size;
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

            child.set.value();

            child.element.style[ `padding${ t2.formats.capitalize( orientations.start ) }` ] = "1em";

            if ( clicked )
            {
                child.element.style[ orientations.dimension ] = size;
                previous = child;
                this.set.config( "value", child.config.value );
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