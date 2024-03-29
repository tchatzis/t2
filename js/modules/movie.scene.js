const Scene = function( sceneParams )
{
    let self = this;
    let unloads = [];

    this.name = sceneParams.name;

    this.addModule = async ( params ) => await importModule( params );

    this.addUnload = ( unloadParams ) => unloads.push( unloadParams );  

    this.modules = new Map();

    this.parameters = {};
    
    this.pause = function()
    {
        clearTimeout( self.timeout );
        delete this.timeout;
    };
    
    this.start = async function()
    {
        console.log( `%c scene: ${ self.parameters.name } ${ self.parameters.duration }`, "background: green;" );

        // excute the script
        if ( self.parameters.script )
            await self.parameters.script.call( self );

        await self.addModule( { default: "default", invoke: "init", path: `../projects/${ self.parameters.name }/index`, namespace: self.parameters.name } );

        if ( self.parameters.duration < Infinity )
            self.timeout = setTimeout( 
                function()
                {
                    if ( self.parameters.next )
                    {
                        self.unload();
                        t2.movie.nextScene( self.parameters.next );
                    }
                }, 
                self.parameters.duration );
    };

    this.timer = function()
    {
        
    };
    
    this.unload = function()
    {
        unloads.forEach( unloadParams => 
        {
            let object = ( unloadParams.namespace == "this" ) ? self : self.modules.get( unloadParams.namespace );
            let f = object[ unloadParams.execute ];

            if ( f )
                f.apply( object, unloadParams.arguments );
        } );
    };
    
    Object.assign( this.parameters, sceneParams );

    // load the module, save to self.modules.get( namespace ) and invoke it
    async function importModule( params )
    {
        let module   = await import( `./${ params.path }.js` );
        let instance = await new module[ params.default ]( params.arguments );
            instance.info =
            {
                namespace: params.namespace,
                scene: self,
                class: instance.constructor.name
            };

        // invoke the function
        await instance[ params.invoke ]( self, params );

        self.modules.set( params.namespace, instance );
        
        return instance;
    }
};

export default Scene;