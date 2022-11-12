
import formats from "./t2.formats.js";
import Handlers from "./t2.component.handlers.js";

const Axes = function()
{
    let self = this;
    let columns = new Map();
    let rows = new Map();
    let listeners = { row: [], column: [], cell: [], submit: [] };
    let active = { row: null, column: null, cell: null };

    this.init = function( params )
    {
        let table = t2.common.el( "table", this.parent.element );
            table.setAttribute( "cellpadding", 0 );
            table.setAttribute( "cellspacing", 0 );

        this.element = t2.common.el( "tbody", table );

        Object.assign( this, params );

        Handlers.call( this );
    };

    this.addRow = function( params )
    {
        let input = params.input;

        rows.set( input.name, params );
    };

    this.addCellListener = function( listener )
    {
        listeners.cell.push( listener );
    };

    this.addColumnListener = function( listener )
    {
        listeners.column.push( listener );
    };

    this.addRowListener = function( listener )
    {
        listeners.row.push( listener );
    };

    this.addSubmitListener = function( listener )
    {
        listeners.submit.push( listener );
    };

    this.edit = async function( args )
    {
        let data = args.data
        let config = args.config

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
                    listener.handler( { form: form, data: args.data, [ self.row.name ]: data, config: config } );
                } );
                parent.hide();
            } } );

        Array.from( config.entries() ).forEach( column =>
        {
            let name = column[ 0 ];
            let config = column[ 1 ];
            let data = args.object.value;

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

    this.highlight = function( key )
    {
        let row = document.querySelector( `[ data-key = "${ key }" ]` );
            row?.classList.add( "highlight" );
    };

    this.normal = function( key )
    {
        let row = document.querySelector( `[ data-key = "${ key }" ]` );
            row?.classList.remove( "highlight" );
    };

    this.populate = function( params )
    {
        this.element.innerHTML = null;
        
        if ( params )
            this.setObject( params );
            
        this.setColumns(); 
        this.setRows();  
    };

    this.setObject = function( params )
    {
        let t = params.date.getDay();
        let today = params.date.getDate();

        for ( let i = 1; i <= 5; i++ )
        {
            let date = new Date();
                date.setDate( today + ( i - t ) );

            columns.set( t2.formats.isoDate( date ), params.column );
        }
        
        Object.assign( this, params );

        this.columns = Array.from( columns.keys() );
    };

    this.setRows = function()
    {
        this.rows = this.row.array;

        let config = this.cell;
        
        this.rows.forEach( key =>
        {
            if ( !key )
                return;
            
            let row = t2.common.el( "tr", self.element );
                
            let th = t2.common.el( "td", row );
                th.classList.add( "data" );
                th.textContent = key;
                th.setAttribute( "data-key", key );

            listeners.row.forEach( listener =>
            {
                th.addEventListener( listener.type, ( e ) => 
                { 
                    e.preventDefault(); 

                    let data = this.data.map( item => { return { [ item[ this.column.name ] ]: item?.[ this.row.name ]?.[ key ] } } );
  
                    listener.handler( row, { [ key ]: data }, rows ); 
    
                    self.highlight( key );
                    self.normal( active.row?.getAttribute( "data-key" ) );
    
                    active.row = th;
                } );
    
                th.classList.add( "tr" );
            } );

            let display = [];

            this.columns.forEach( column => 
            {
                let td = t2.common.el( "td", row );
                let data = this.data.filter( item => t2.formats.isoDate( item[ this.column.name ] ) == column && item[ this.row.name ] == key );
                let value = config.cell.value( data, config, td );
                let predicate = !!data.length;
 
                config.format.forEach( f => value = t2.formats[ f ]( value ) );

                display.push( !!predicate );

                td.classList.add( "data" );
                td.classList.add( css( config.cell, column, { [ config.input.name ]: value } ) );
                td.classList.add( ...config.format );
                td.textContent = predicate ? value : "";
            } );

            if ( !display.some( bool => bool ) )
                row.classList.add( "hidden" );
        } );
    };

    this.setColumns = function()
    {
        let row = t2.common.el( "tr", this.element );
        
        let th = t2.common.el( "th", row );
            th.textContent = this.cell.input.name;
            th.classList.add( "header" );

        this.columns.forEach( column => 
        {
            let th = t2.common.el( "th", row );
                th.textContent = column;
                th.classList.add( "header" );
                th.setAttribute( "data-key", column );

            listeners.column.forEach( listener =>
            {
                th.addEventListener( listener.type, ( e ) => 
                { 
                    e.preventDefault(); 

                    let data = this.data.find( item => item[ this.column.name ] == column );

                    listener.handler( { element: th, column: { name: this.column.name, value: column }, object: { name: this.row.name, value: data[ this.row.name ] }, data: data, config: rows } ); 

                    self.highlight( column );
                    self.normal( active.column?.getAttribute( "data-key" ) );
    
                    active.column = th;
                } );
    
                th.classList.add( "tr" );
            } );
        } );
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
};

export default Axes;