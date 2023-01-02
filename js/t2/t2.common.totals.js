import formats from "./t2.formats.js";

const Totals = function( columns )
{
    let self = this;

    this.columns = columns;
    
    this.totals = {};
    this.totals._display = false;

    this.addTotal = function( record )
    {
        self.columns.forEach( column => 
        {
            let config = columns.get( column );
            let value = this.formatter( config, column, record, 1 );
        } );

        this.setTotals();
    };

    this.formatter = function( config, column, record, operator )
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

    this.removeTotal = function( record )
    {
        self.columns.forEach( column => 
        {
            let config = columns.get( column );
            let value = this.formatter( config, column, record, -1 );
        } );

        this.setTotals();
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

    this.setTotals = function()
    {
        this.totals._display = !!this.columns.length;
        
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

    this.updateTotals = function()
    {
        this.resetTotals();

        this.array.forEach( record => this.addTotal( record ) );
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
};

export default Totals;