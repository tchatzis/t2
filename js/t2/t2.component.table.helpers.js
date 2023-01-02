const helpers = 
{
    // helpers
    css: function( cell, column, record )
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
    },

    // row listeners
    listen: function( self, row, record, listeners, active, columns )
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
    },

    // resize the header / footer columns
    resize: function( self )
    {
        let index = 0;

        for ( let td of self.element.firstChild.children )
        {
            let width = td.offsetWidth + "px";

            if ( self.header.children[ index ] )
                self.header.children[ index ].style.width = width;

            if ( self.footer.children[ index ] )
                self.footer.children[ index ].style.width = width;

            index++;
        }
    },

    show: function( columns, column )
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
    }
};

export default helpers;