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
        let cell = params.cell;

        let input = t2.common.el( params.input.tag || "input", this.element );
            input.style.width = ( cell.display + 1 ) + "em";
            input.setAttribute( "placeholder", attributes.name );
            input.setAttribute( "Form", this.form.id );

        switch ( params.input.tag )
        {
            case "select":
                params.options.forEach( option => 
                {
                    let o = t2.common.el( "option", input );
                        o.text = option;
                        o.value = option;
                    if ( params.input.value == option )
                        o.setAttribute( "selected", "" );
                } );
            break;
        }

        for ( let attr in attributes )
            if ( attributes.hasOwnProperty( attr ) )
                input.setAttribute( attr, attributes[ attr ] );
    };
};

export default Form;