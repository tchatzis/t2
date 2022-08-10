const Schema = function( data )
{
    this.init = ( params ) => t2.schemas[ params.name ] = new Schema( params );

    function Schema( params )
    {   
        [ "create", "edit", "read" ].forEach( mode => this[ mode ] = new Map() );

        let id = params.name + ( data.id || 0 );

        let form = t2.common.el( "form", params.parent );
            form.id = id;
            form.addEventListener( "submit", params.handler ); //module.handlers.create.call( list, e, params )

        this.setCell = ( config ) =>
        {
            let cell = t2.common.el( "div", params.parent );
                cell.classList.add( "data" );
                cell.style.padding = 0;
                cell.style.display = config.display ? "inline-flex" : "none";
                cell.style.width = config.display + "em";

            let object = {};
                object.cell = cell;

            if ( config.css )
            {
                let css;
                
                if ( config.css.hasOwnProperty( "data" ) )
                    css = data[ config.css.data ]?.toLowerCase();
                else if ( config.css.hasOwnProperty( "column" ) )   
                    css = config.name?.toLowerCase();
                else
                    css = config.css.class;

                cell.classList.add( css );
            }

            if ( config.input )
            {
                let attrs = config.input;
                let input = t2.common.el( "input", cell );
                    input.style.width = config.display + "em";
                    input.setAttribute( "name", config.name );
                    input.setAttribute( "Form", id );
                    input.setAttribute( "placeholder", config.name );

                for ( let attr in attrs )
                    input.setAttribute( attr, attrs[ attr ] );

                object.input = input;
            }

            this[ config.mode ].set( config.name, object );

            return cell;
        };
    }
};

export default Schema;