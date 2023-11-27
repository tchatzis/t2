
const Attributes = function( params )
{
    this.class = params.class;
    this.id = params.id;
    this.path = params.path;
    this.uuid = t2.common.uuid();
    this.widget = params.widget;
};

const Column = function( col )
{
    this.display = !!col.display;
    this.format = col.format || "none";
    this.classes = col.classes || [ this.format ];
    this.formula = col.formula;
    this.key = col.key || "id";
    this.primaryKey = !!col.primaryKey;
    this.label = col.label || col.key.replace( /_/g, " " );
    this.mode = col.mode || [ "read" ];
    this.sort = col.sort;
    this.source = col.source;
    this.total = { calculation: col.total?.calculation, value: 0 };
    this.type = col.type || String;
    this.validate = col.validate || {};
    this.validate.key = this.validate.key || "keypress";
    this.validate.content = this.validate.content || "keyup"; 
    this.values = [];
    this.widget = col.widget ? col.widget : ( ~this.mode.indexOf( "write" ) ) ? "edit" : "text";
};

const Internals = function( params )
{
    const self = this;
    const delim = ".";
    const columns = new Map();
    const data = {};

    const Detail = function( params )
    {
        this.channel = params.channel;
        this.widget = params.widget;
        this.source = params.source || self;

        this.key = this.source.config.primaryKey;
        this.record = this.widget.config.record;
        this.value = this.record[ this.key ];
    };

    this.config = {};
    this.handlers = {};

    params.class = this.constructor.name;

    this.attributes = new Attributes( params );

    this.element.id = params.id;
    this.element.addEventListener( "contextmenu", ( e ) => e.preventDefault() );

    this.children = this.attributes.children || new Map();

    this.add = 
    {
        column: ( c ) => 
        {
            columns.set( c.key, new Column( c ) );

            let column = columns.get( c.key );

            if ( column.primaryKey )
                this.set.config( "primaryKey", c.key );

            if ( column.sort )    
                this.set.config( "sort", { key: c.key, direction: column.sort, type: column.type } );

            if ( column.validate )
                this.set.config( "validate", c.validate );

            return column;
        },
        css: ( cls ) => this.element.classList.add( cls ),
        handler: ( h ) => this.element.addEventListener( h.event, ( e ) => 
        {
            e.stopPropagation();
            
            h.handler( { event: e, widget: this, record: h.record } );
        }, true ),
        widget: async ( params ) =>
        {   
            let widget = await t2.widget.create( params );
                widget.set.parent( this );
                widget.set.path();

                set.attributes( widget );

            let path = widget.get.path();

            t2.widget.children.set( path, this );

            return widget;
        }
    };

    this.event =
    {
        send: ( params ) =>
        {
            let detail = new Detail( params );
            let event = new CustomEvent( this.attributes.uuid, { detail: detail } );

            this.element.dispatchEvent( event );
            this.set.config( "value", detail.value );
        },
        receive: ( params ) =>
        {
            let source = params.source;
                source.element.addEventListener( source.attributes.uuid, params.handler, true );
                source.event.subscribers.set( this, [] );

            params.channel.forEach( channel => source.event.subscribers.get( this ).push( { [ channel ]: params.handler } ) );

            //console.log( "subscribers", source.event.subscribers );
        },
        subscribers: new Map()
    };

    this.get =
    {
        bbox: ( element ) => ( element || this.element ).getBoundingClientRect(),
        collection: async ( name ) => 
        {
            let object = await t2.db.tx.retrieve( name );
            
            data.raw = object.data;
            data.array = data.raw ? [ ...data.raw ] : [];

            this.set.config( "count", this.config.primitive ? 0 : data.array.length );

            return data.array;
        },
        column: ( key ) => columns.get( key ),
        copy: () => [ ...data.array ],
        count: () =>
        {
            let count = this.config.primitive ? 0 : data.array.length;
            
            this.set.config( "count", count );
            
            return count;
        },
        data: () => data.array,
        path: () => this.attributes.path.join( delim ),
        schema: () => Object.fromEntries( columns ),
        sort: () =>
        {
            let schema = this.get.schema();
            let column = Object.values( schema ).find( column => column.sort );

            return column ? { direction: column.sort, key: column.key, type: column.type } : null;
        },
        value: () => this.config.value,
        widget:
        {
            by:
            {
                filter: ( filter, global ) =>
                {
                    let map = global ? t2.widget.children : this.children;
                    
                    for ( let [ uuid, widget ] of map )
                    {
                        let config = widget.config;
                        
                        if ( config.record?.[ filter.key ] == filter.value )
                        {
                            return widget;
                        }
                    }
                },
                id: ( id, global ) => this.get.widget.by.filter( { key: "id", value: id }, global ),
                path: ( path, global ) =>
                {
                    let map = global ? t2.widget.children : this.children;
                    
                    for ( let [ uuid, widget ] of map )
                    {
                        let attributes = widget.attributes;
                        
                        if ( attributes.path.join( delim ) == path )
                        {
                            return widget;
                        }
                    }
                },
                uuid: ( uuid, global ) => this.get.widget.by.filter( { key: "uuid", value: uuid }, global )
            }
        }
    };

    this.remove =
    {
        css: ( cls ) => this.element.classList.remove( cls )
    };

    this.set =
    {
        config: ( key, value ) => this.config[ key ] = value,
        data: ( d ) => 
        {
            data.raw = d;

            this.set.upgrade();
        },
        detail: ( params ) =>
        {
            return new Detail( params );
        },
        element: ( element ) => element.appendChild( this.element ),
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
        },
        from:
        {
            columns: () => 
            {
                let records = [];
                
                columns.forEach( column =>
                {
                    let record = { id: column.key, label: column.label, [ column.key ]: column.key };
                    
                    records.push( record );
                } );

                this.set.source( () => records );
            },
            record: () => {}
        },
        parent: ( parent ) => 
        {
            this.parent = parent;
            this.parent.children.set( params.id, this );
            this.set.element( this.parent.element );
        },
        path: () => 
        {
            let id = this.attributes.id.split( delim );

            this.attributes.path = this.parent.attributes.path.concat( id );
        },
        source: async ( f ) => 
        {
            this.refresh = f;
            
            data.raw = await this.refresh();

            this.set.config( "count", this.config.primitive ? 0 : data.raw.length );
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
        upgrade: () =>
        {
            // upgrade array elements to object
            if ( typeof data.raw[ 0 ] !== "object" )
            { 
                if ( !this.config.primitive )
                {
                    data.array = data.raw.map( record => { return { [ this.config.primaryKey ]: record } } );
                }
            }
            else
            {
                data.array = [ ...data.raw ];
            }
        }
    };

    this.sort =
    {
        asc:  ( a, b ) => 
        {
            let Type = this.config.sort.type;
            let key = this.config.sort.key;

            return new Type( a[ key ] ) - new Type( b[ key ] );
        },
        desc: ( a, b ) => 
        {
            let Type = this.config.sort.type;
            let key = this.config.sort.key;

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
        Date:
        {
            key: ( key ) =>
            {
                const regex = new RegExp( /[0-9-: ]/ );

                return regex.test( key );
            },
            content: ( content ) =>
            {
                const regex = new RegExp( /^(20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]) (0[0-9]|1[012]):([012345][0-9]):([012345][0-9])$/ );

                return regex.test( content );
            }
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
        },
        Object:
        {
            key: () => true,
            content: ( content ) => typeof content == "object"
        },
        String:
        {
            key: ( key ) =>
            {
                const regex = new RegExp( /^[A-Za-z0-9\s-,.]+$/ );

                return regex.test( key );
            },
            content: ( content ) => typeof content == "string"
        }
    };

    // private functions
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

    const set =
    {
        attributes: ( widget ) =>
        {
            let attributes = new Attributes( self.attributes );
            
            for ( let attr in attributes )
            {
                widget.element.setAttribute( `data-${ attr }`, widget.attributes[ attr ].toString().replace( /,/g, delim ) );
            }
        }
    };
};

export default Internals;