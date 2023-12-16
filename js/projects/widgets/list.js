import Internals from "../widgets/widget.internals.js";

const List = function( params )
{ 
    // required
    this.element = document.createElement( "ul" );

    // common
    Internals.call( this, params );

    // extend externals
    this.add.item = async ( record ) =>
    {
        record.uuid = uuid;

        for ( let column in schema )
        {  
            let config = schema[ column ];
            let value = record[ config.key ];

            if ( config.display )
            {
                let load = async ( index ) =>
                {      
                    let widget = await this.add.widget( { id: `${ column }.${ index }`, path: params.path, widget: "text", config: config, record: record } );
                        widget.set.source( () => t2.formats[ config.format ]( value ) );
                        widget.set.config( "record", record );

                        widget.set.config( "index", index );
                        widget.set.config( "primitive", true );
                        widget.add.css( "item" );
                        widget.remove.css( "none" );

                    config.classes.forEach( cls => widget.add.css( cls ) );

                    return widget;
                };

                fulfill.add( load( index ) );

                index++;
            }
        }
    };


};

export default List;