const IndexedDB = function()
{
    let scope = this;
    
    // CRUD
    this.tx = {};
    
    this.tx.create = async function( table, data )
    {
        let transaction = scope.db.transaction( [ table ], "readwrite" );
        let store = transaction.objectStore( table );
        let request = store.add( data );
            request.onerror = ( e ) => console.log( e.target.error );
        let promise = await scope.promise( request, "success" );
        
        data.id = promise.result;

        return { id: promise.result, data: data, table: table };
    };
    
    this.tx.delete = async function( table, id )
    {
        let transaction = scope.db.transaction( [ table ], "readwrite" );
        let store = transaction.objectStore( table );
        let data = store.get( id );
            data.onerror = ( e ) => console.log( e.target.error );
        let promise = await scope.promise( data, "success" );
        let request = store.delete( id );
            request.onerror = ( e ) => console.log( e.target.error );
        let complete = await scope.promise( transaction, "complete" );

        return { id: id, data: promise.result, table: table };
    };
        
    this.tx.filter = async function( table, filters )
    {
        let data = [];
        let id = [];
        let transaction = scope.db.transaction( [ table ], "readonly" );
        let store = transaction.objectStore( table );
        let cursor = store.openCursor();
        let promise = new Promise( ( resolve ) =>
        {                          
            cursor.onsuccess = ( e ) =>
            {
                let result = e.target.result;
  
                if ( result ) 
                {
                    let pass = filter( result.value );

                    if ( pass )
                    {
                        let d = result.value;
                            d.id = result.key;
                        data.push( d );
                        id.push( result.key );
                    }

                    result.continue();
                }
                else
                    return resolve();
            };
        } );
        
        /*function filter( result )
        {
            let match = [];
            
            let map = Object.entries( filters ).map( filter => 
            {
                let key = filter[ 0 ];
                let value = filter[ 1 ];
                let condition = result[ key ] == value;
                
                if ( condition )
                    match.push( condition );
            } );
            
            let conditions = [];
                conditions.push( Object.entries( filters ).length == match.length );
                conditions = conditions.concat( match );
            
            return conditions.every( bool => bool );      
        }*/

        function filter( result )
        {
            let match = [];
            
            filters.forEach( filter => 
            {
                let condition = false;
                
                if ( filter.key == "datetime" )
                {
                    let date = t2.formats.isoDate( result[ filter.key ] );
                    condition = eval( `"${ date }" ${ filter.operator } "${ filter.value }"` );
                }
                else
                    condition = eval( `"${ result[ filter.key ] }" ${ filter.operator } "${ filter.value }"` );

                if ( condition )
                    match.push( condition );
            } );
            
            let conditions = [];
                conditions.push( Object.entries( filters ).length == match.length );
                conditions = conditions.concat( match );
            
            return conditions.every( bool => bool );      
        }
        
        await promise;

        return { id: id, data: data, table: table };
    };
    
    this.tx.read = async function( table, id )
    {
        let transaction = scope.db.transaction( [ table ], "readonly" );
        let store = transaction.objectStore( table );
        let request = store.get( id );
            request.onerror = ( e ) => console.log( e.target.error );
        let promise = await scope.promise( request, "success" );
        let data = promise.result;

        return { id: id, data: promise.result, table: table };
    };
    
    this.tx.retrieve = async function( table )
    {
        let data = [];
        let id = [];
        let transaction = scope.db.transaction( [ table ], "readonly" );
        let store = transaction.objectStore( table );
        let cursor = store.openCursor();
        let promise = new Promise( ( resolve ) =>
        {                          
            cursor.onsuccess = ( e ) =>
            {
                let result = e.target.result;
                
                if ( result ) 
                {
                    let d = result.value;
                        d.id = result.key;
                        data.push( d );
                        id.push( result.key );

                    result.continue();
                }
                else
                    return resolve();
            };
        } );
        
        await promise;

        return { id: id, data: data, table: table };
    };

    this.tx.overwrite = async function( table, id, data )
    {
        id = Number( id );
        
        let record = {};
        let transaction = scope.db.transaction( [ table ], "readwrite" );
        let store = transaction.objectStore( table );
            store.openCursor().onsuccess = ( e ) =>
            {
                const cursor = e.target.result;
                const value = cursor.value;

                if ( value.id == id )
                {
                    data.id = id;

                    const request = cursor.update( data );
                        request.onsuccess = () => console.log( "overwrite:", data );  
                }
                else
                    cursor.continue();
            };

        return { id: id, data: record, table: table };        
    };
 
    this.tx.update = async function( table, id, data )
    {
        id = Number( id );
        
        let transaction = scope.db.transaction( [ table ], "readwrite" );
        let store = transaction.objectStore( table );
            store.openCursor().onsuccess = ( e ) =>
            {
                const cursor = e.target.result;
                const value = cursor.value;

                if ( value.id == id )
                {
                    for ( let d in data )
                    {
                        if ( data.hasOwnProperty( d ) )
                            value[ d ] = data[ d ];
                    }

                    const request = cursor.update( value );
                        request.onsuccess = () => {};  
                }
                else
                    cursor.continue();
            };

        return { id: id, data: data, table: table };        
    };

    this.init = function( params )
    {
        this.supported = "indexedDB" in window;

        if ( !this.supported )
            return false;

        open( params, {} );
    };

    async function open( params )
    {
        await scope.open( params );
        params.persists = await navigator.storage.persist();
        t2.db.persists = params.persists;
        t2.db.version = params.version;
        console.log( `%c IndexedDB: ${ params.name } version: ${ params.version }`, "background: purple;" );  
    }
    
    this.open = async function( params )
    {    
        let request = window.indexedDB.open( ...Object.values( params ) );
            request.onerror = ( e ) => 
            {
                //console.log( e.target.error.message )
                params.version++;
                open( params );
            };

        let promise = await this.promise( request, "success" );

        scope.db = promise.result;
        scope.name = scope.db.name;
        scope.version = scope.db.version;

        return scope.db;
    };
    
    this.promise = function( emitter, type )
    {
        return new Promise( ( resolve ) => 
        {
            const handle = ( e ) =>
            {
                resolve( e.target );
                emitter.removeEventListener( type, handle );
            };

            emitter.addEventListener( type, handle ); 
        } );  
    };
    
    this.table = {};

    this.table.add = async function ( data )
    {
        scope.version = Number( data.version );

        scope.db.close();

        let request = window.indexedDB.open( scope.name, data.version );
            request.onupgradeneeded = ( e ) =>
            {
                scope.db = e.target.result;

                console.log( "upgrade", scope.db );

                if( !scope.db.objectStoreNames.contains( data.table ) )
                    scope.db.createObjectStore( data.table, { autoIncrement: true, keyPath: "id" } );
            };
            
    };

    this.table.get = async function( table )
    {
        return await scope.db.objectStore( table, { autoIncrement: true } );
    };
};

export default IndexedDB; 