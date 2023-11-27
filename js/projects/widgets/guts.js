const Column = function( col )
{
    this.display = !!col.display;
    this.format = col.format || "none";
    this.classes = col.classes || [ this.format ];
    this.formula = col.formula;
    this.key = col.key;
    this.primaryKey = !!col.primaryKey;
    this.label = col.label || col.key.replace( / /g, " " );
    this.mode = col.mode || [ "read" ];
    this.sort = col.sort;
    this.source = col.source;
    this.total = { calculation: col.total?.calculation, value: 0 };
    this.type = col.type || String;
    this.values = [];
    this.widget = col.widget || "content";
};

const Guts = function()
{
    let columns = new Map();
    let data = {};

    this.add =
    {
        column: ( c ) => 
        {
            columns.set( c.key, new Column( c ) );

            let column = columns.get( c.key );

            if ( column.primaryKey )
                this.params.primaryKey = c.key;

            if ( column.sort )    
            {
                this.params.sort = { key: c.key, direction: column.sort, type: column.type };
            }

            return column;
        },
        css: ( cls ) => this.element.classList.add( cls ),
        parent: ( widget ) =>
        {
            //widget.add.child( this );
            widget.element.appendChild( this.element );
        },
        widget: ( widget ) =>
        {
            t2.ui.children.set( this.params.path, widget );
            this.children.set( widget.id, widget );
            this.element.appendChild( widget.element );
        }
    };
    
    this.remove = 
    {
        column: ( key ) => columns.delete( key ),
        //record: ( d ) => records.delete( d )
    };
    
    this.get =
    {
        collection: async ( name ) => 
        {
            let object = await t2.db.tx.retrieve( name );
            
            data.raw = object.data;
            data.array = data.raw ? [ ...data.raw ] : [];

            this.params.count = data.array.length;

            return data.array;
        },
        column: ( key ) => columns.get( key ),
        copy: () => [ ...data.array ],
        data: () => data.array,
        //record: ( pk ) => records.get( pk ),
        //records: () => Array.from( records.values() ),
        schema: () => Object.fromEntries( columns ),
        value: ( id, key ) => this.get.record( id )[ key ]
    };
    
    this.set =
    {
        filter: ( condition ) => 
        {
            let components = condition.split( " " );

            if ( components.length < 3 )
            {
                console.error( "Invalid argument", components );
                return this.get.copy();
            }

            let statement = `record.${ components[ 0 ] } ${ components[ 1 ] } ${ components[ 2 ] }`;
        
            data.array = this.get.copy().filter( record => 
            {
                if ( record.hasOwnProperty( components[ 0 ] ) )
                    return eval( statement );
                else
                {
                    console.error( "Invalid key", components[ 0 ] );
                    return true;
                }
            } );

            //duplicate.call( this );
        },
        node: ( element ) => 
        {
            this.parent = { element: element };
            element.appendChild( this.element );
        },
        source: ( f ) => 
        {
            this.refresh = f;   
        },
        total: ( key ) =>
        {
            let array = this.get.data();

            if ( !array )
                return;
            
            let column = this.get.column( key );
                column.values = array.map( r => column.type.call( null, r[ key ] ) );

            if ( column.total )
                column.total.value = calculate[ column.total.calculation ]( column.values );
        },
        value: ( c, d, v ) =>
        {
            let value = this.get.value( c, d );
                value = v;
        }
    };

    this.sort =
    {
        asc:  ( a, b ) => 
        {
            let Type = this.params.sort.type;
            let key = this.params.sort.key;

            return new Type( a[ key ] ) - new Type( b[ key ] );
        },
        desc: ( a, b ) => 
        {
            let Type = this.params.sort.type;
            let key = this.params.sort.key;

            return new Type( b[ key ] ) - new Type( a[ key ] );
        }
    };

    this.validate =
    {
        Array:
        {
            key: () => true,
            content: ( content ) => Array.isArray( content )
        },
        Number: 
        {
            key: ( key ) =>
            {
                const regex = new RegExp( /[0-9-,.]/ );

                return regex.test( key );
            },
            content: ( content ) =>
            {
                const regex = new RegExp( /^-?\d+\.?\d*$/ );

                return regex.test( content );
            }
        }
    };
    
    const calculate =
    {
        add: ( a ) => a.reduce( ( b, c ) => b + c, 0 ),
        sub: ( a ) => a.reduce( ( b, c ) => b - c, 0 ),
        mul: ( a ) => a.reduce( ( b, c ) => b * c, 0 ),
        div: ( a ) => a.reduce( ( b, c ) => b / c, 0 ),
        
        avg: ( a ) => calculate.add( a ) / a.length,
        std: ( a ) =>
        {
            let avg = calculate.avg( a );
            let num = a.length;
            let std = calculate.add( a.map( b => Math.sqrt( ( b - avg ) ** 2 ) / num ) );

            return std;
        }
    };
    
    // prefab
    this.add.column( 
    {
        key: "uuid"
    } );
};

export default Guts;

