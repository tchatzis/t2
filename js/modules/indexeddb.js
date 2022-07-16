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

        return { id: promise.result, data: data };
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

        return { id: id, data: promise.result };
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
        
        function filter( result )
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
        }
        
        await promise;

        return { id: id, data: data };
    };
    
    /*this.tx.query = async function( table, query )
    {
        let data = [];
        let transaction = scope.db.transaction( [ table ], "readonly" );
        let store = transaction.objectStore( table );
        let request = store.getAll( query );
            request.onerror = ( e ) => console.log( e.target.error );
        let promise = await scope.promise( request, "success" );
        
        return { id: 0, data: promise.result };
    };*/
    
    this.tx.read = async function( table, id )
    {
        let transaction = scope.db.transaction( [ table ], "readonly" );
        let store = transaction.objectStore( table );
        let request = store.get( id );
            request.onerror = ( e ) => console.log( e.target.error );
        let promise = await scope.promise( request, "success" );
        let data = promise.result;

        return { id: id, data: promise.result };
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

        return { id: id, data: data };
    };
 
    this.tx.update = async function( table, id, data )
    {
        let transaction = scope.db.transaction( [ table ], "readwrite" );
        let store = transaction.objectStore( table );
        let request = store.put( data, id );
            request.onerror = ( e ) => console.log( e.target.error );
        let promise = await scope.promise( request, "success" );

        return { id: id, data: promise.result };        
    };

    this.init = function()
    {
        this.supported = "indexedDB" in window;
        
        if ( !this.supported )
            return false;
    };
    
    this.open = async function( name, version, table )
    {
        this.name = name;
        this.version = version;
        
        let request = window.indexedDB.open( name, version );
            request.onerror = ( e ) => console.error( e );
        
        if ( table )
        {
            let upgrade = await this.promise( request, "upgradeneeded" );//request.onupgradeneeded = ( e ) => scope.upgrade( e, table );
        }

        let promise = await this.promise( request, "success" );
        
        this.db = promise.result;
        
        return this.db;
    };
    
    this.promise = function( emitter, type )
    {
        return new Promise( ( resolve, reject ) => 
        {
            const handle = ( e ) =>
            {
                emitter.removeEventListener( type, handle );
                resolve( e.target );
            };

            emitter.addEventListener( type, handle );
        } );  
    };
    
    this.table = {};
    this.table.add  = async ( table ) => this.open( this.name, this.version++, table );
    /*this.table.get = async ( table ) => 
    {
        return scope.db.objectStore( table, { autoIncrement: true } );
        
    };*/
    
    this.upgrade = function( e, table )
    {
        console.log( "Upgrading...");
        
        let db = e.target.result;
        
        if( !db.objectStoreNames.contains( table ) )
            db.createObjectStore( table, { autoIncrement: true } ); 
    };
};

export default IndexedDB; 