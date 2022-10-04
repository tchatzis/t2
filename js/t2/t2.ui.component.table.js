import formats from "./t2.formats.js";

const Table = function()
{
    let self = this;
    let el = t2.common.el;
    let columns = new Map();
    let allowed = new Map();
    let listeners = { row: [], column: [], submit: [] };

    this.totals = {};

    this.init = function( params )
    {
        let table = el( "table", this.parent.element );
            table.setAttribute( "cellpadding", 0 );
            table.setAttribute( "cellspacing", 0 );

        this.header = el( "thead", table );
        this.element = el( "tbody", table );
        this.footer = el( "tfoot", table );
    };

    this.addColumn = function( params )
    {
        let input = params.input;
        let cell = params.cell;
            cell.modes.forEach( mode => allowed.set( mode ) );

        if ( input.type == "number" )
            this.totals[ input.name ] = 0;

        columns.set( input.name, params );
    };

    this.addRowListener = function( listener )
    {
        listeners.row.push( listener );
    };

    this.addSubmitListener = function( listener )
    {
        listeners.submit.push( listener );
    };

    this.allColumns = function( params )
    {
        if ( !params.array.length )
            return;
        
        let keys = Object.keys( params.array[ 0 ] );
            keys.forEach( key =>
            {
                let config = 
                {
                    input: { name: key, type: "text" }, 
                    cell: { css: { class: "data" }, display: 6, modes: [ "read" ] }
                };

                this.addColumn( config );
            } );

        this.setColumns( "read" );
        this.populate( params );
    };

    this.edit = async function()
    {
        let e = arguments[ 0 ];
            e.preventDefault();

        let data = arguments[ 1 ];

        let columns = arguments[ 2 ];

        self.highlight( data.id );

        let content = t2.ui.elements.get( "content" );
        let container = await content.addContainer( { id: "edit", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "text" } );
            title.set( `Edit \u00BB ${ data.id }` );  

        let form = await container.addComponent( { id: data.id, type: "form", format: "block" } );
            form.addListener( { type: "submit", handler: function ( data )
            {
                listeners.submit.forEach( listener => listener.handler.call( form, data ) );
            } } );

        Array.from( columns.entries() ).forEach( column =>
        {
            let name = column[ 0 ];
            let config = column[ 1 ];

            if ( config.cell.modes.find( mode => mode == "edit" ) )
            {
                let input = Object.assign( { label: name, name: name, type: config.input.type, value: data[ name ] || config.input.value || "" }, config.input );

                form.addField( { 
                    input: input, 
                    cell: config.cell,
                    format: config.format, 
                    options: config.options } );
                }
        } );
    };

    this.highlight = function( id )
    {
        let row = document.querySelector( `[ data-id = "${ id }" ]` );
            row?.classList.add( "highlight" );
    };

    this.normal = function( id )
    {
        let row = document.querySelector( `[ data-id = "${ id }" ]` );
            row?.classList.remove( "highlight" );
    };

    this.setColumns = function( mode, hidden )
    {
        this.columns = Array.from( columns.keys() );

        this.header.innerHTML = null;
        if ( hidden )
            this.header.classList.add( "hidden" );

        this.footer.innerHTML = null;

        let th = el( "th", this.header );
            th.style.width = "2em";

        let tf = el( "th", this.footer );
            tf.style.width = "2em";    

        this.columns.forEach( column => 
        {
            let display = show( column, mode );

            let th = el( "th", this.header );
                th.textContent = column;
                th.style.display = display;

            let tf = el( "th", this.footer );
                tf.setAttribute( "data-column", column );
                tf.style.display = display;
        } );
    };

    this.setTotals = function()
    {
        this.columns.forEach( ( column, index ) => 
        {
            let params = columns.get( column );

            if ( params.input.type == "number" )
            {
                let value = this.totals[ column ];

                params.format?.forEach( f => value = formats[ f ]( value ) );

                let cell = this.footer.children[ index + 1 ];
                    cell.classList.add( "value" );
                    cell.classList.add( "totals" );
                    cell.textContent = value;
            }
        } );
    };

    this.populate = function( args )
    {
        this.reset();
        
        let use = args.orderBy ? t2.common.sort( args.array, args.orderBy ) : args.array;

            if ( !use.length )
            {
                this.parent.hide();

                return;
            }
            
            use.forEach( ( record, index ) => 
            {             
                //let mode = args.mode || "read";

                let row = el( "tr", self.element );
                    row.setAttribute( "data-id", record.id );
                    row.setAttribute( "data-index", index );
                    row.setAttribute( "data-count", use.length );

                listeners.row.forEach( listener =>
                {
                    row.addEventListener( listener.type, ( e ) => listener.handler( e, record, columns ) );
                    row.classList.add( "tr" );
                } );

                if ( record.disabled )
                    row.classList.add( "disabled" );

                display( row, record, index );
            } );

        this.array = use;
    };

    this.reset = function()
    {
        this.columns.forEach( column => this.totals[ column ] = 0 );
        this.element.innerHTML = null;
    };

    function css( cell, column, record )
    {
        let css = "data";
        
        if ( cell.css )
        {
            let option = Object.keys( cell.css )[ 0 ];

            switch( option )
            {
                case "class":
                    css = cell.css.class;
                break;
                
                case "column":
                    css = column.toLowerCase();
                break;

                case "predicate":
                    let predicate = cell.css.predicate.conditions.every( condition => eval( `${ record[ condition.name ] } ${ condition.operator } ${ condition.value }` ) );

                    css = cell.css.predicate.options[ 1 - predicate ];
                break;
                
                case "value":
                    css = record[ cell.css.value || column ]?.toLowerCase();
                break;
            } 
        }

        return css;
    }

    function display( row, record, index )
    {
        row.innerHTML = null;

        //let modes = [ "read", "edit" ];

        /*let form = el( "form", row );
            form.setAttribute( "id", record.id );
            form.addEventListener( "submit", ( e ) => 
            { 
                e.preventDefault(); 

                let form = e.target; 
                let formdata = new FormData( form );
                let data = {};   
                let array = Array.from( formdata.entries() );
                    array.forEach( input => data[ input[ 0 ] ] = input[ 1 ] );
                
                self.handlers.update( e, data ); 
            } );*/

        let th = el( "th", row );
            th.style.width = "2em";
            th.textContent = index + 1;
        /*if ( Array.from( allowed.keys() ).find( mode => mode == "edit" ) )
        {
            th.style.cursor = "pointer";
            th.addEventListener( "click", ( e ) =>
            {
                e.preventDefault();
                e.stopPropagation();

                let index = modes.indexOf( mode );

                mode = modes[ 1 - index ];

                self.setColumns( mode );
                display( mode, row, record, index );
            } );
        }*/
        
        self.columns.forEach( ( column, index ) => 
        {
            let config = columns.get( column );
            let attributes = config.input;
            let cell = config.cell;
            //let handler = config.handler;
            let format = config.format || [];
            if ( attributes.type == "number" )
                format.unshift( "number" );
            let value = record[ column ];
            let th = self.header.children[ index + 1 ];
            let tf = self.footer.children[ index + 1 ];
            let display = show( column );

            // columns values and totals
            switch ( attributes.type )
            {
                case "number":
                    if ( config.formula )
                    {
                        value = config.formula( { column: column, record: record, totals: self.totals, value: Number( value ) } );         
                    }  
                    else
                    {
                        self.totals[ column ] += Number( value ); 
                    }
                break;
            };

            if ( format  )
            {
                format.forEach( f => value = formats[ f ]( value, column, record ) );
            }

            let td = el( "td", row );
                td.classList.add( "data" );
                td.style.width = cell.display + "em";
                td.classList.add( css( cell, column, record ) );
                td.style.display = display;
                td.textContent = value;
            /*if ( handler && mode == "read" && value )
            {
                td.addEventListener( "click", ( e ) => { e.preventDefault(); e.stopPropagation(); handler( e.target, record ) } );
                td.classList.add( "handler" );
                td.setAttribute( "data-column", column );
            }*/

            /* switch disply mode
            if ( cell.modes.find( e => e == mode ) )
            {
                switch ( mode )
                {
                    case "edit":
                        td.innerHTML = null;

                        let input = el( "input", td );
                            input.style.width = ( cell.display + 1 ) + "em";
                            input.setAttribute( "placeholder", column );
                            input.setAttribute( "Form", record.id );
                        if ( value )
                        {
                            input.setAttribute( "data-value", value );
                            input.setAttribute( "value", value );
                        }

                        for ( let attr in attributes )
                            if ( attributes.hasOwnProperty( attr ) )
                                input.setAttribute( attr, attributes[ attr ] );  
                    break;

                    case "read":
                        td.textContent = value;
                    break;
                }
            }*/

            // set header / footer column widths
            th.style.width = td.offsetWidth + "px";
            tf.style.width = td.offsetWidth + "px";
        } );
    }

    function show( column )
    {
        let display = "none"; 
        let params = columns.get( column );
        let conditions = [];
            conditions.push( params.input.type !== "hidden" );
            conditions.push( params.cell.modes.find( mode => mode == "read" ) );
            conditions.push( params.cell.display );

        if ( conditions.every( bool => bool ) )
            display = "table-cell";

        return display;
    };
};

export default Table;