
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
    const data = {};

    let columns = new Map();
    let debug = false;

    const Detail = function( params )
    {
        this.channel = params.channel;
        this.widget = params.widget;
        this.source = params.source || self;

        if ( this.widget )
        {           
            this.id = this.widget.attributes.id;
            this.record = this.widget.config.record;
            this.value = this.record ? this.record[ this.record.key ] : null;
        }
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
            let type = `${ this.attributes.uuid }.${ params.channel }`;
            let event = new CustomEvent( type, { detail: detail } );

            if ( detail.widget )
            {
                this.element.dispatchEvent( event );
                this.set.config( "value", detail.value );
            }
        },
        receive: ( params ) =>
        {
            let source = params.source;
            let subscribers = source.event.subscribers.get( this ) ? source.event.subscribers.get( this ) : [];

            source.event.subscribers.set( this, subscribers );

            params.channel.forEach( channel => 
            {
                let type = `${ source.attributes.uuid }.${ channel }`;
                subscribers.push( { [ channel ]: params.handler } );
                source.element.addEventListener( type, params.handler, true );
            } );
        },
        subscribers: new Map()
    };

    this.get =
    {
        bbox: ( element ) => ( element || this.element ).getBoundingClientRect(),
        collection: async ( name ) =>
        { 
            let result = await t2.db.tx.retrieve( name );

            this.set.config( "dataset", true );

            return result.data;
        },
        column: ( key ) => columns.get( key ),
        copy: () => [ ...data.array ],
        count: () => data.array.length,
        data: () => data.array,
        html: async ( src ) => await ( await fetch( src ) ).text(),
        path: () => this.attributes.path.join( delim ),
        schema: () => Object.fromEntries( columns ),
        sort: () =>
        {
            let schema = this.get.schema();
            let column = Object.values( schema ).find( column => column.sort );

            return column ? { direction: column.sort, key: column.key, type: column.type } : null;
        },
        value: () => this.config.values,
        widget:
        {
            by:
            {
                child: ( id, global ) => 
                {
                    let map = global ? t2.widget.children : this.children;
                        
                    return map.get( id );
                },
                filter: ( filter, global ) =>
                {
                    let map = global ? t2.widget.children : this.children;
                    
                    for ( let [ uuid, widget ] of map )
                    {
                        let config = widget.config;

                        if ( debug )
                            console.log( "filter:", config.record, filter )
                        
                        if ( config.record?.[ filter.key ] == filter.value )
                        {
                            return widget;
                        }
                    }
                },
                id: ( id, global ) => this.get.widget.by.filter( { key: "id", value: id }, global ),
                index: ( index, global ) => this.get.widget.by.filter( { key: "index", value: index }, global ),
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
        data: async ( d ) => 
        {
            data.raw = d;
            data.array = data.raw ? [ ...data.raw ] : [];
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
        parent: ( parent ) => 
        {
            this.parent = parent;
            this.parent.children.set( params.id, this );
            this.set.element( this.parent.element );
        },
        path: () => 
        {
            let id = this.attributes.id.toString().split( delim );

            this.attributes.path = this.parent.attributes.path.concat( id );
        },
        source: async ( f ) => 
        {
            let pk = this.config.primaryKey || "value";
            
            // expected argument
            if ( typeof f == "function" )
                this.refresh = f;
            // force to function
            else
                this.refresh = () => f;

            const d = await this.refresh();
            let data = d;

            const Rules = function()
            {
                let normalized = [];

                this.check =
                {
                    columns: ( d ) => 
                    {
                        let keys = Object.keys( self.get.schema() );
                        let pass = !!keys.length;
                        
                        if ( !pass )
                            throw( "columns must be added" );

                        if ( d.every( record => !Object.keys( record ).find( key => keys.find( k => k == key ) ) ) )
                            throw( `'${ keys }' cannot be found in record` );
                        
                        return pass;
                    },
                    dataset: () => !!self.config.dataset,
                    primaryKey: ( d ) => 
                    {
                        if ( !self.config.primaryKey )
                            throw( "primary key must be configured" );

                        if ( d.every( record => !Object.keys( record ).find( key => key == self.config.primaryKey ) ) )
                            throw( `'${ self.config.primaryKey }' cannot be found in record` );
                        
                        return !!self.config.primaryKey;
                    }
                };
                
                this.each =
                {
                    object: ( d ) =>
                    {
                        let resolved = [];
                        
                        d.forEach( ( item, index ) =>
                        {
                            let pass = this.is.object( item );
                            resolved.push( pass );

                            if ( pass )
                            {
                                self.add.column( { key: pk, display: true } );

                                normalized.push( { index: index, key: pk, [ pk ]: item[ pk ] } );
                            }
                        } );

                        return resolved.every( pass => pass );
                    },
                    primitive: ( d ) =>
                    {
                        let resolved = [];
                        
                        d.forEach( ( item, index ) =>
                        {
                            let pass = this.is.primitive( item );
                            resolved.push( pass );
                            
                            if ( pass )
                            {
                                self.add.column( { key: pk, display: true } );

                                normalized.push( { index: index, key: pk, [ pk ]: item } );
                            }
                        } );

                        return resolved.every( pass => pass );
                    }
                };

                this.get =
                {
                    normalized: () => normalized
                };
                
                this.is =
                {
                    array: ( d ) => Array.isArray( d ),
                    object: ( d ) => ( typeof d == "object" ) && this.not.array( d ),
                    primitive: ( d ) => d !== Object( d ),
                    resolved: () => !!normalized.length
                };

                this.not =
                {
                    array: ( d ) => !this.is.array( d ),
                    dataset: () => !this.check.dataset(),
                    object: ( d ) => !this.is.object( d ),
                    primaryKey: () => 
                    {
                        delete self.config.primaryKey;
                        
                        return true;
                    }
                };

                this.to =
                {
                    array: ( d ) => 
                    {
                        data = Object.values( d );

                        return !!data.length;
                    },
                    object: ( d ) =>
                    {
                        self.add.column( { key: pk, display: true } );
                        
                        normalized.push( { index: 0, key: pk, [ pk ]: d } );

                        return this.is.resolved();
                    },
                    unchanged: ( d ) => 
                    {
                        normalized = d.map( ( record, index ) => Object.assign( record, { index: index, key: pk } ) );
 
                        return this.is.resolved();
                    }
                };

                this.reset = () =>
                { 
                    columns.delete( "value" );
                    data = d;
                    normalized = [];
                };
            };

            let rules = new Rules();

            let checks =
            {
                // primitive
                0: { desc: "data is not an array. data is a primitive. data to object. data to array.", rules: [ rules.not.array, rules.is.primitive, rules.to.object ] },
                // array
                1: { desc: "data is an array. elements are primitives.", rules: [ rules.is.array, rules.each.primitive ] },
                2: { desc: "data is an array. elements are objects. check not from database. check primary key.", rules: [ rules.is.array, rules.each.object, rules.not.dataset, rules.check.primaryKey ] },
                3: { desc: "data is an array. elements are objects. check if from database. check columns. check primary key, do not alter.", rules: [ rules.is.array, rules.check.dataset, rules.check.columns, rules.check.primaryKey, rules.to.unchanged ] }, // from database
                // object
                4: { desc: "data is an object. set to an array. elements are primitives. primary key is undefined.", rules: [ rules.is.object, rules.to.array, rules.each.primitive, rules.not.primaryKey ] },
                5: { desc: "data is an object. set to an array. element is an object. primary key is defined.", rules: [ rules.is.object, rules.to.array, rules.each.object, rules.check.primaryKey ] },
            };

            debug = false /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            if ( debug )
                console.log( self.attributes.class, "input", d );

            for ( let check in checks )
            {
                let obj = checks[ check ];
                let outcome = [];
                
                // check each rule. break if failed.
                for ( let rule of obj.rules )
                {
                    let pass = rule( data );
                    outcome.push( pass );

                    if ( !pass )
                        break;
                }

                // every rule passed?
                let resolved = outcome.every( outcome => outcome );

                if ( resolved )
                {
                    // get, set and return the normalized data
                    const output = rules.get.normalized();
                    
                    if ( debug )
                    {
                        console.warn( check, obj.desc, outcome, resolved );
                        console.log( "output", ...output );
                    }

                    self.set.data( output );

                    return output;
                }

                // or else next check routine
                rules.reset();
            }
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
        value: () => this.element.innerHTML = this.value
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