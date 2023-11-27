import Common from "../widgets/common.js";
import Guts from "../widgets/guts.js";
import Handlers from "../widgets/handlers.js";

const Multi = function( params )
{ 
    this.element = document.createElement( "div" );
    
    this.params = params;
    this.params.class = this.constructor.name;

    // common
    Guts.call( this );
    Common.call( this );
    Handlers.call( this );

    this.init = async () =>
    {
        this.populate();
        /*

        await this.data.populate( async ( record, index ) => 
        {
            let link = await t2.widget.create( { id: record[ this.display.config.label.value ], type: "box" } );
            let value = record[ this.display.config.label.value ];
            let text = record[ this.display.config.label.text ];
            let display = t2.formats[ this.display.config.label.format ]( text );
            let label = 
            {
                config: this.display.config.label,
                display: display,
                index: index, 
                text: text,
                value: value
            };
            let packet = { broadcaster: this, index: index, label: label, value: value, record: record, widget: link }; 
            let click = new this.event.Packet( packet );
            let contextmenu = new this.event.Packet( packet );

            link.data.packet = click;
            link.css.add( this.display.config.type );
            link.content.add( display );
            link.event.broadcaster.add( { type: "click", packet: click } );
            link.event.broadcaster.add( { type: "contextmenu", packet: contextmenu } );
            link.event.subscribe( { type: "click", broadcaster: this, handler: ( packet ) => this.handlers.toggle( packet ) } );
            link.data.packet = packet;

            this.action.init( { parent: this, widget: link } );

            return link;
        } );

        if ( this.display?.config.orientation )
            this.css.add( this.display.config.orientation );*/
    };

    this.populate = async () =>
    {
        const fulfill = new t2.common.Fulfill();
        const array = await this.refresh();
            array.forEach( item => 
            {
                const load = async () =>
                {
                    let link = await t2.widget.create( { id: item, type: "box" } );
                        link.css.add( "button" );
                        link.set.source( () => item );
                        link.init();

                    return link;
                };

                fulfill.add( load() );
            } );

        let links = await fulfill.resolve();
            links.forEach( link => link.set.node( this.element ) );
    };
};

export default Multi;