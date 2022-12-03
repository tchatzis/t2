import formats from "./t2.formats.js";
import Handlers from "./t2.component.handlers.js";

const Table = function()
{
    let self = this;
    let el = t2.common.el;
    let columns = new Map();
    let listeners = { row: [], column: [], submit: [] };
    let active = { highlight: null };
    let loading;

    this.totals = {};

    this.init = function( params )
    {
        let table = el( "table", this.parent.element );
            table.setAttribute( "cellpadding", 0 );
            table.setAttribute( "cellspacing", 0 );

        this.header = el( "thead", table );
        this.element = el( "tbody", table );
        this.footer = el( "tfoot", table );

        this.format = "block";

        Object.assign( this, params );

        Handlers.call( this );
    };

    this.addColumn = function( params )
    {
        let input = params.input;
        let cell = params.cell;

        if ( input.type == "number" )
            this.totals[ input.name ] = 0;

        columns.set( input.name, params );
    };

    this.addRow = function( record, index )
    {
        let row = el( "tr", self.element );
            row.setAttribute( "data-id", record.id );
            row.setAttribute( "data-index", index );
            row.setAttribute( "data-count", this.array.length );

        listen( row, record );
        display( row, record, index );

        if ( record.disabled )
            row.classList.add( "disabled" );
    };

    this.removeRow = function( record )
    {

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
        let data = arguments[ 0 ];

        let columns = arguments[ 1 ];

        let subcontent = t2.ui.children.get( "subcontent" );
        let parent = await subcontent.addContainer( { id: "popop", type: "popup", format: "block" } );
            parent.clear();
            parent.show();

        self.highlight( data.id );

        let container = await parent.addContainer( { id: "edit", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Edit \u00BB ${ data.id }` );  

        let form = await container.addComponent( { id: `${ self.id }.${ data.id }`, type: "form", format: "block" } );
            form.addListener( { type: "submit", handler: function ( data )
            {
                listeners.submit.forEach( listener => 
                {
                    listener.handler.call( form, data );
                } );
                parent.hide();
            } } );

        Array.from( columns.entries() ).forEach( column =>
        {
            let name = column[ 0 ];
            let config = column[ 1 ];

            if ( config.cell.modes.find( mode => mode == "edit" ) )
            {
                let input = Object.assign( { label: name, name: name, type: config.input.type, value: data[ name ] || config.input.value || "" }, config.input );

                if ( config.input.type == "checkbox" )
                {
                    let checked = !!data[ name ];

                    if ( checked )
                        input.checked = checked;
                }

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

        this.array = use;

        if ( !use.length )
        {
            this.parent.hide();

            return;
        }

        use.forEach( ( record, index ) => this.addRow( record, index ) );
    };

    this.reset = function()
    {
        this.columns.forEach( column => this.totals[ column ] = 0 );
        this.element.innerHTML = null;
    };

    this.update = function( key, data )
    {
        let row = this.array.find( item => item[ key ] == data[ key ] );
            row = data;

        this.hightlight( data[ key ] );
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

        let th = el( "th", row );
            th.style.width = "2em";
            th.textContent = index + 1;
        
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

            format?.forEach( f => value = formats[ f ]( value, column, record ) );

            let td = el( "td", row );
                td.classList.add( "data" );
                td.style.width = cell.display + "em";
                td.classList.add( css( cell, column, record ) );
                td.style.display = display;
                td.textContent = value;

            // set header / footer column widths
            th.style.width = td.offsetWidth + "px";
            tf.style.width = td.offsetWidth + "px";
        } );
    }

    function listen( row, record )
    {
        listeners.row.forEach( ( listener ) =>
        {
            row.addEventListener( listener.type, ( e ) => 
            { 
                e.preventDefault(); 

                listener.handler( record, columns, row ); 

                self.normal( active.highlight?.getAttribute( "data-id" ) );

                active.highlight = row;
            } );

            row.classList.add( "tr" );
        } );
    };

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