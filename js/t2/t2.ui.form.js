const Form = function( module )
{
    let self = this;

    this.init = function( params )
    {
        this.form = t2.common.el( "form", params.parent );
        this.form.setAttribute( "id", params.id );
        this.form.style.display = "none";
        
        this.element = t2.common.el( "div", params.parent );
        this.element.id = params.id;
        this.element.style.display = params.horizontal ? "flex" : "block";
    };

    this.addField = function( params )
    {
        let attributes = params.input;
        let input;
        let id = t2.common.uuid();

        if ( attributes.label )
        {
            let label = t2.common.el( "label", this.element );
                label.textContent = attributes.label;
                label.setAttribute( "for", id );
                label.classList.add( "label" );
        }

        switch ( attributes.type )
        {
            case "checkbox":
                input = t2.common.el( "input", this.element ); 
                input.setAttribute( "id", id );
                input.setAttribute( "type", attributes.type );
                input.setAttribute( "checked", !!attributes.value );
            break;
            
            case "datalist":
                input = t2.common.el( "input", this.element ); 
                input.setAttribute( "list", id );
                input.setAttribute( "type", attributes.type );

                let datalist = t2.common.el( "datalist", this.element ); 
                    datalist.setAttribute( "id", id );

                params.options.forEach( option => 
                {
                    let o = t2.common.el( "option", datalist );
                        o.text = option;
                        o.value = option;
                } );
            break;

            case "datetime":
                input = t2.common.el( "input", this.element );
                input.setAttribute( "type", "datetime-local" ); 
                input.setAttribute( "step", 1 ); 
            break;
            
            case "select":
                input = t2.common.el( "select", this.element );

                params.options.forEach( option => 
                {
                    let o = t2.common.el( "option", input );
                        o.text = option;
                        o.value = option;
                    if ( params.input.value == option )
                        o.setAttribute( "selected", "" );
                } );
            break;

            case "textarea":
                input = t2.common.el( "textarea", this.element );
            break;

            default:
                input = t2.common.el( "input", this.element );  
                input.setAttribute( "type", attributes.type );          
            break;
        }
            
        for ( let attr in attributes )
            if ( attributes.hasOwnProperty( attr ) )
            {
                if ( attr !== "type" )
                    input.setAttribute( attr, attributes[ attr ] );
            }

        input.style.width = ( params.cell.display + 1 ) + "em";
        input.setAttribute( "placeholder", attributes.name );
        input.setAttribute( "Form", this.form.id );

        if ( params.update )
            params.update( input );
    };
};

export default Form;