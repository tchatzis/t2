const Queries = function()
{
    const operators = 
    {
        "date.eq": ( params ) =>
        {
            if ( params.value.every( value => value !== undefined ) )
            {
                params.value.forEach( value => this.data.filtered = this.data.filtered.filter( record => t2.formats[ params.format ]( record[ params.name ] ) == value ) );
            }
        },
        
        "date.between": ( params ) =>
        {
            //console.log( params )
            
            if ( params.value.every( value => value !== undefined ) )
            {
                let from = new Date( params.value[ 0 ] );
                let to = new Date( params.value[ 1 ] );
                    to.setDate( to.getDate() + 2 );
    
                this.data.filtered = this.data.filtered.filter( record => ( new Date( record[ params.name ] ) > from && new Date( record[ params.name ] ) < to ) );  
            }
        },
        
        eq: ( params ) => 
        {
            if ( params.value.every( value => value !== undefined ) )
            {
                params.value.forEach( value => this.data.filtered = this.data.filtered.filter( record => record[ params.name ] == value ) );
            }
        }
    };
    
    this.data = {};
    
    this.init = function( params )
    {
        Object.assign( this, params );
    };

    this.define = function( definitions )
    {
        definitions.forEach( property => 
        {
            let map = new Map();

            this.data[ property.use ].map( record => map.set( record[ property.key ], record ) );

            let array = Array.from( map.keys() );
                array = array.map( item => t2.formats[ property.format ]( item ) );
            this.data[ property.key ] = array.sort( this.sort[ property.sort ] );
        } ); 
    };

    this.filters = {};
    this.filters.add = ( params ) => operators[ params.operator ]( params );

    this.refresh = async function()
    {
        let records = await t2.db.tx.retrieve( this.table );

        this.data.all = records.data;
        this.data.filtered = [ ...records.data ];
    };

    this.set = ( name, value ) => this.data[ name ] = value;

    this.sort =
    {
        asc:  ( a, b ) => ( a > b ) ? 1 : -1,
        desc: ( a, b ) => ( a < b ) ? 1 : -1
    };
};

export default Queries;