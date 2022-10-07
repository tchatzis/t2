import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    let self = this;
    let listeners = [];
    
    this.init = function( params )
    {
        this.element = t2.common.el( "div", this.parent.element );
        this.element.classList.add( params.format );
        
        this.form = t2.common.el( "form", this.element );
        this.form.setAttribute( "id", params.id );
        this.form.style.display = "none";
        this.form.addEventListener( "submit", this.submit );
        this.form.data = {};

        Object.assign( this, params );

        Handlers.call( this );
    };

    this.addField = function( params )
    {
        let attributes = params.input;
        let input;
        let id = t2.common.uuid();
        let div = t2.common.el( "div", this.element );
            div.classList.add( "field" );
            div.setAttribute( "data-name", attributes.name || attributes.type );
            div.classList.add( "underline" );

        if ( attributes.label && attributes.type !== "hidden" )
        {
            let label = t2.common.el( "label", div );
                label.textContent = attributes.label;
                label.setAttribute( "for", id );
                label.classList.add( "label" );
        }

        switch ( attributes.type )
        {
            case "checkbox":
                input = t2.common.el( "input", div ); 
                input.setAttribute( "id", id );
                input.setAttribute( "type", attributes.type );
            if ( attributes.checked )
                input.setAttribute( "checked", "" );
            break;
            
            case "datalist":
                input = t2.common.el( "input", div ); 
                input.setAttribute( "list", id );
                input.setAttribute( "type", attributes.type );

                let datalist = t2.common.el( "datalist", div ); 
                    datalist.setAttribute( "id", id );

                params.options.forEach( option => 
                {
                    let o = t2.common.el( "option", datalist );
                        o.text = option;
                        o.value = option;
                } );

                input.setAttribute( "placeholder", attributes.name );
            break;

            case "datetime":
                input = t2.common.el( "input", div );
                input.setAttribute( "type", "datetime-local" ); 
                input.setAttribute( "step", 1 ); 
            break;
            
            case "select":
                input = t2.common.el( "select", div );

                params.options.forEach( option => 
                {
                    let o = t2.common.el( "option", input );
                        o.text = option;
                        o.value = option;
                    if ( params.input.value == option )
                        o.setAttribute( "selected", "" );
                } );

                input.setAttribute( "placeholder", "-- please select --" );
            break;

            case "submit":
                if ( this.element.classList.contains( "block" ) )
                {
                    let label = t2.common.el( "label", div );
                        label.classList.add( "label" );
                }

                input = t2.common.el( "input", div );  
                input.setAttribute( "type", attributes.type );          
            break;            

            case "textarea":
                input = t2.common.el( "textarea", div );
            break;

            default:
                input = t2.common.el( "input", div );  
                input.setAttribute( "type", attributes.type );  
                input.setAttribute( "placeholder", attributes.name );        
            break;
        }
            
        for ( let attr in attributes )
        {
            if ( attributes.hasOwnProperty( attr ) )
            {
                if ( [ "id", "checked", "label", "list", "type" ].indexOf( attr ) == -1  )
                    input.setAttribute( attr, attributes[ attr ] );
            }

            // submit fixes
            if ( attributes.type == "submit" )
            {
                div.classList.remove( "underline" );
                
                if ( attr == "name" )
                    input.removeAttribute( attr );
            }
        }

        let fid = this.form.getAttribute( "id" );

        input.style.width = ( params.cell.display + 1 ) + "em"; 
        input.setAttribute( "Form", fid );

        params.listeners?.forEach( listener => 
        {
            input.addEventListener( listener.type, () => listener.handler( this.form, input ) );
        } );

        if ( params.update )
            params.update( input );
    };

    // additional submit handlers
    this.addListener = function( listener )
    {
        listeners.push( listener );
    };

    this.change = function( form, input )
    {
        switch ( input.type )
        {
            case "checkbox":
                self.form.data[ input.name ] = input.checked;
            break;

            case "number":
                self.form.data[ input.name ] = Number( input.value );
            break;

            case "select":
                self.form.data[ input.name ] = input.options[ input.selectedIndex ];
            break;

            default:
                self.form.data[ input.name ] = input.value;
            break;
        }
    };

    /*this.save = async function( table, data, key )
    {        
        let filtered = await t2.db.tx.filter( table, [ { key: key, operator: "==" , value: data[ key ] } ] );

        if ( filtered.data.length )
        {
            //let record = await t2.db.tx.update( table, data );

            return filtered;
        }
        else
        {
            let record = await t2.db.tx.create( table, data );
            //console.log( "save", table, data, record );

            return record;
        }
    };*/

    this.submit = function( e )
    { 
        e.preventDefault(); 

        let data = {};

        Array.from( new FormData( e.target ).entries() ).forEach( field => data[ field[ 0 ] ] = field[ 1 ] );

        self.form.data = data;
 
        listeners.forEach( async ( listener ) => await listener.handler.call( e, data ) );
    };
};

export default Component;