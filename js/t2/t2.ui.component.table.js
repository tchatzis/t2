import helpers from "./t2.component.table.helpers.js";
import Handlers from "./t2.component.handlers.js";
import Totals from "./t2.common.totals.js";

const Component = function()
{
    let self = this;
    let el = t2.common.el;
    let columns = new Map();
    let listeners = { row: [], column: [], submit: [] };
    let modifiers = { row: [] };
    let active = { highlight: null };

    // initialize
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

    // listeners
    this.addRowListener = function( listener )
    {
        listeners.row.push( listener );
    };

    this.addRowModifier = function( f )
    {
        modifiers.row.push( f );
    };

    this.addSubmitListener = function( listener )
    {
        listeners.submit.push( listener );
    };

    // elements
    this.headerless = function()
    {
        this.header.classList.add( "hidden" );
    };

    this.highlight = function( id )
    {
        let row = this.element.querySelector( `[ data-id = "${ id }" ]` );
            row?.classList.add( "highlight" );
    };

    this.hsl = function( id, value )
    { 
        let row = this.element.querySelector( `[ data-id = "${ id }" ]` );
            row.style.backgroundColor = `hsl( ${ value }, 100%, 30% )`;
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
            let display = helpers.show( columns, column );

            let th = el( "th", this.header );
                th.textContent = column?.replace( /_/g, " " );
                th.style.display = display;

            let tf = el( "th", this.footer );
                tf.setAttribute( "data-column", column );
                tf.style.display = display;
        } );
    };

    this.unhighlight = function( id )
    {
        let row = this.element.querySelector( `[ data-id = "${ id }" ]` );
            row?.classList.remove( "highlight" );
    };

    // data
    this.edit = async function( args )
    {
        let data = args.data;
        let columns = args.columns;

        let submargin = t2.ui.children.get( "submargin" );
        let parent = await submargin.addContainer( { id: "popop", type: "popup", format: "block" } );
            parent.clear();
            parent.show();

        self.highlight( data.id );

        let container = await parent.addContainer( { id: data.id, type: "box", format: "block" } );
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

    this.populate = function( args )
    {
        this.reset();

        this.array = args.orderBy ? t2.common.sort( args.array, args.orderBy, args.dir ) : args.array;
        this.orderBy = args.orderBy;
        this.dir = args.dir;

        if ( !this.array.length )
        {
            this.parent.hide();

            return;
        }

        this.parent.show();

        this.array.forEach( ( record, index ) => this.addRow( record, index ) );

        helpers.resize( this );
    };

    this.reset = function()
    {
        this.resetTotals();
        this.element.innerHTML = null;
    };

    this.update = function( args )
    {
        let _args = { array: args.array || this.array, orderBy: args.orderBy || this.orderBy, dir: args.dir || this.dir };

        this.populate( _args );
        
        if ( this.totals._display )
            this.setTotals(); 
    };
    
    // column
    this.addColumn = function( params )
    {
        let input = params.input;

        if ( input.type == "number" )
            this.totals[ input.name ] = 0;

        columns.set( input.name, params );

        this.setHeaders();
    };

    // row
    this.addRow = function( record, index, insert )
    {
        let row = document.createElement( "tr" );
            row.setAttribute( "data-id", record.id );
            row.setAttribute( "data-index", index );
            row.setAttribute( "data-count", this.array.length );

        if ( this.dir !== "desc" )
        { 
            row.scrollIntoView();
        }

        if ( !insert )
        {
            this.element.appendChild( row );
        }
        else
        {
            this.element.insertBefore( row, this.element.firstChild );              
        }

        helpers.listen( self, row, record, listeners, active, columns );
        this.updateRow( row, record, index );

        if ( record.disabled )
            row.classList.add( "disabled" );
    };

    this.removeRow = function( record )
    {
        let row = this.element.querySelector( `[ data-id = "${ record.id }" ]` );
            row.remove();

        if ( this.totals._display )
            this.removeTotal( record );
    };

    this.updateRow = function( row, record, index )
    {
        row.innerHTML = null;

        let th = el( "th", row );
            th.style.width = "2em";
            th.textContent = index + 1;

        modifiers.row.forEach( f => f( row, record, index ) );
        
        self.columns.forEach( column => 
        {
            let config = columns.get( column );
            let value = this.formatter( config, column, record, 1 );

            // display
            let cell = config.cell;
            let display = helpers.show( columns, column ); 

            let td = el( "td", row );
                td.classList.add( "data" );
                td.style.width = cell.display + "em";
                td.classList.add( helpers.css( cell, column, record ) );
                td.style.display = display;
                td.textContent = value;
        } );

        if ( this.totals._display )
            this.setTotals();
    };

    // totals
    Totals.call( this, columns );
};

export default Component;