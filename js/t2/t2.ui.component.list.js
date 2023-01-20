import DND from "../modules/dnd.js";
import helpers from "./t2.component.table.helpers.js";
import Totals from "./t2.common.totals.js";
import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    let self = this;
    let el = t2.common.el;
    let columns = new Map();
    let listeners = { add: [], remove: [], save: [], row: [] };
    let active = { highlight: null };
    let dnd = new DND();

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
                th.textContent = column;
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

    // DND
    this.find = function( e )
    {
        let node = e.target;

        while ( node.tagName !== "TR" )
        {
            node = node.parentNode;
        }

        return node;
    };

    // data 
    this.change = function( args )
    {
        if ( Number( args.element.value ) !== args.value )
            args.parent.classList.add( "highlight" );
        else
            args.parent.classList.remove( "highlight" );
    };

    this.populate = function( args )
    {
        controls();

        this.reset();

        add();

        this.array = args.array;
        this.array.forEach( ( record, index ) => this.addRow( record, index + 1 ) );

        dnd.init( this.element, this.find, this.array, () => this.renumber.call( this ) );
        dnd.disable( 0 );

        helpers.resize( self );
    };

    this.renumber = function()
    {   
        let count = this.array.length;
        let children = this.element.children.length;

        for ( let index = 1; index < children; index++ )
        {
            let record = this.array[ index - 1 ];
            let id = `${ this.id }.${ index }`;
            let row = this.element.children[ index ];
                row.dataset.id = record.id || index;
                row.dataset.index = index;
                row.dataset.count = count;

            let th = row.firstChild;
                th.textContent = index;

            let inputs = row.querySelectorAll( "input" );    

            for ( let input of inputs )
            {
                input.dataset.index = index;
                input.setAttribute( "Form", id );
            }   
            
            let form = row.querySelector( "form" );
                form.id = id;
        };
    };

    this.reset = function()
    {
        this.resetTotals();
        this.element.innerHTML = null;
        this.array = [];
    };

    this.update = function( args )
    {
        let _args = { array: args.array || this.array };
        
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
    this.addRow = function( record, index )
    {
        record.id = record.id || index;

        let row = el( "tr", self.element );
            row.setAttribute( "data-id", record.id );
            row.setAttribute( "data-index", index );
            row.setAttribute( "data-count", this.array.length );

        if ( index )
        {
            dnd.enable( row, index );
            dnd.items.push( row );
        }

        helpers.listen( self, row, record, listeners, active, columns );
        this.updateRow( row, record, index );  
        
        this.resetRow( record, 0 );

        if ( record.disabled )
            row.classList.add( "disabled" );
    };

    this.removeRow = function( record, index )
    {
        let row = this.element.querySelector( `[ data-index = "${ index }" ]` );
            row.remove();

        if ( this.totals._display )
            this.removeTotal( record );

        this.array.splice( index - 1, 1 );

        this.renumber();
    };

    this.resetRow = function( record, index )
    {
        let row = this.element.querySelector( `[ data-index = "${ index }" ]` );

        for ( let td of row.children )
            td.classList.remove( "highlight" );
    };

    this.saveRow = function( record, index )
    {
        record.id = record.id || index;
        
        this.array.splice( index - 1, 1, record );

        this.updateTotals();
    };

    this.updateRow = function( row, record, index )
    {
        row.innerHTML = null;

        let th = el( "th", row );
            th.style.width = "2em";
            th.textContent = index;

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
            
            input( index, td, value, config.input );
        } );

        // form
        let td = el( "td", row );
            td.classList.add( "hidden" );

        let form = el( "form", td );
            form.id = `${ self.id }.${ index }`;
            form.addEventListener( "submit", submit );

        if ( this.totals._display )
            this.setTotals();
    };

    // totals
    Totals.call( this, columns );

    // default ( add ) row
    function add()
    {
        let record = {};

        for ( let [ id, config ] of columns )
            if ( config.input.type !== "submit" )
                record[ id ] = null;

        self.addRow( record, 0 );
    }

    // add controls
    function controls()
    {
        self.addColumn( { 
            input: { name: "add", type: "submit", value: "+" }, 
            cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
            format: [] } );
        self.addColumn( { 
            input: { name: "remove", type: "submit", value: "-" }, 
            cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
            format: [] } );
    }

    function input( index, td, value, config )
    {
        let id = `${ self.id }.${ index }`;
        let f;
        let v;

        switch( config.name )
        {
            case "add":
                f = index ? "save" : config.name;
                f = f + "Row";
                v = index ? "\u2705" : "\u2795";
            break;

            case "remove":
                f = index ? config.name : "reset";
                f = f + "Row";
                v = index ? "\u274C" : "  ";
            break;

            default:
                f = index ? "change" : null; 
                v = value;
            break;
        }

        let input = el( "input", td );
            Object.assign( input, config );
            input.setAttribute( "value", v );
            input.setAttribute( "Form", id );
            input.setAttribute( "data-function", f );
            input.setAttribute( "data-index", index );
            input.addEventListener( "input", () => self.change( { config: config, element: input, id: id, index: index, parent: td, value: value } ) );
    }

    // button handlers
    function submit( e )
    {
        e.preventDefault();

        let button = e.submitter;
        let action = button.dataset.function;
        let formdata = new FormData( e.target );
        let index = Number( button.dataset.index );
        let record = {};

        for ( let [ column, value ] of formdata )
        {
            let config = columns.get( column );
                config.format.forEach( f => value = t2.formats[ f ]( value ) );
            
            record[ column ] = value;
        }

        switch ( action )
        {
            case "addRow":
                self.array.push( record );
                self[ action ]( record, self.array.length );
            break;

            case "removeRow":
                self[ action ]( record, index );
            break;

            case "resetRow":
                e.target.reset();
                self[ action ]( record, index );
            break;

            case "saveRow":
                self[ action ]( record, index );
            break;
        }
    }
};

export default Component;