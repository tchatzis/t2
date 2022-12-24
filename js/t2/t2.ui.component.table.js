import formats from "./t2.formats.js";
import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    let self = this;
    let el = t2.common.el;
    let columns = new Map();
    let listeners = { row: [], column: [], submit: [] };
    let active = { highlight: null };
    let totals = false;

    this.totals = {};

    this.addColumn = function( params )
    {
        let input = params.input;

        if ( input.type == "number" )
            this.totals[ input.name ] = 0;

        columns.set( input.name, params );

        this.setHeaders();
    };

    this.addRow = function( record, index )
    {
        let row = el( "tr", self.element );
            row.setAttribute( "data-id", record.id );
            row.setAttribute( "data-index", index );
            row.setAttribute( "data-count", this.array.length );

        listen( row, record );
        this.updateRow( row, record, index );

        if ( record.disabled )
            row.classList.add( "disabled" );
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

    this.edit = async function( args )
    {
        let data = args.data;
        let columns = args.columns;

        let subcontent = t2.ui.children.get( "subcontent" );
        let parent = await subcontent.addContainer( { id: "popop", type: "popup", format: "block" } );
            parent.clear();
            parent.show();

        self.highlight( data.id );

        let container = await parent.addContainer( { id: "edit", type: "box", format: "block" } );
            container.element.style.position = "relative";
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Edit \u00BB ${ data.id }` );  

        let form = await container.addComponent( { id: `${ self.id }.${ data.id }`, type: "form", format: "block" } );
            form.addListener( { type: "submit", handler: ( arg ) =>
            {
                listeners.submit.forEach( listener => 
                {
                    listener.handler( { event: arg.event, data: arg.data, table: self, row: args.row, columns: columns } );
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

    this.headerless = function()
    {
        this.header.classList.add( "hidden" );
    };

    this.highlight = function( id )
    {
        let row = document.querySelector( `[ data-id = "${ id }" ]` );
            row?.classList.add( "highlight" );
    };

    this.hsl = function( id, value )
    { 
        let row = document.querySelector( `[ data-id = "${ id }" ]` );
            row.style.backgroundColor = `hsl( ${ value }, 100%, 30% )`;
    };

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

    this.populate = function( args )
    {
        this.reset();

        let use = args.orderBy ? t2.common.sort( args.array, args.orderBy ) : args.array;

        this.array = use;
        this.orderBy = args.orderBy;

        if ( !use.length )
        {
            this.parent.hide();

            return;
        }

        use.forEach( ( record, index ) => this.addRow( record, index ) );

        let index = 0;
        
        for ( let td of this.element.firstChild.children )
        {
            let width = td.offsetWidth + "px";

            this.header.children[ index ].style.width = width;
            this.footer.children[ index ].style.width = width;

            index++;
        }
    };

    this.removeRow = function( record )
    {
        let row = this.element.querySelector( `[ data-id = "${ record.id }" ]` );
            row.remove();

        if ( totals )
            this.removeTotal( record );
    };

    this.reset = function()
    {
        this.resetTotals();
        this.element.innerHTML = null;
    };

    this.resetTotals = function()
    {
        this.columns.forEach( ( column ) => 
        {
            let params = columns.get( column );

            if ( params.input.type == "number" )
                this.totals[ column ] = 0;
        } );
    };

    this.setHeaders = function()
    {
        this.columns = Array.from( columns.keys() );

        this.header.innerHTML = null;
        this.footer.innerHTML = null;

        let th = el( "th", this.header );
            th.style.width = "2em";

        let tf = el( "th", this.footer );
            tf.style.width = "2em";    

        this.columns.forEach( column => 
        {
            let display = show( column );

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
        totals = !!this.columns.length;
        
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

    this.unhighlight = function( id )
    {
        let row = document.querySelector( `[ data-id = "${ id }" ]` );
            row?.classList.remove( "highlight" );
    };

    this.update = function( args )
    {
        let _args = { array: args.array || this.array, orderBy: args.orderBy || this.orderBy };
        
        this.populate( _args );
        
        if ( totals )
            this.setTotals(); 
    };

    this.updateRow = function( row, record, index )
    {
        row.innerHTML = null;

        let th = el( "th", row );
            th.style.width = "2em";
            th.textContent = index + 1;
        
        self.columns.forEach( column => 
        {
            let config = columns.get( column );
            let value = formatter( config, column, record, 1 );

            // display
            let cell = config.cell;
            let display = show( column ); 

            let td = el( "td", row );
                td.classList.add( "data" );
                td.style.width = cell.display + "em";
                td.classList.add( css( cell, column, record ) );
                td.style.display = display;
                td.textContent = value;
        } );

        if ( totals )
            this.setTotals();
    };

    this.removeTotal = function( record )
    {
        self.columns.forEach( column => 
        {
            let config = columns.get( column );
            let value = formatter( config, column, record, -1 );
        } );

        this.setTotals();
    };

    // helpers
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

    function formatter( config, column, record, operator )
    {
        let format = config.format || [];
        let attributes = config.input;

        // numbers
        let value = record[ column ];

        // format
        if ( attributes.type == "number" )
        {
            value = numbers( config, column, record, operator );
            format.unshift( "number" );
        }

        format?.forEach( f => value = formats[ f ]( value, column, record ) );

        return value;
    }

    // row listeners
    function listen( row, record )
    {
        listeners.row.forEach( ( listener ) =>
        {
            row.addEventListener( listener.type, ( e ) => 
            { 
                e.preventDefault(); 

                listener.handler( { data: record, columns: columns, row: row } ); 

                self.unhighlight( active.highlight?.getAttribute( "data-id" ) );

                active.highlight = row;
            } );

            row.classList.add( "tr" );
        } );
    };

    // value modifier
    function numbers( config, column, record, operator )
    {
        let value = record[ column ];

        // columns values and totals
        if ( config.formula )
        {
            value = config.formula( { column: column, record: record, totals: self.totals, value: Number( value ) * operator } );         
        }  
        else
        {
            self.totals[ column ] += Number( value ) * operator; 
        }

        return value;
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

export default Component;