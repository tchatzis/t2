const Scene = function( sceneParams )
{
    let self = this;
    let contents = [];
    let scripts = [];
    let unloads = [];

    this.components = new Map();

    // canvas, modal
    this.addComponent = async function( componentParams )
    {
        componentParams.parent = t2.common.getParent( componentParams );

        let module    = await import( `../t2/t2.ui.${ componentParams.component }.js` );
        let component = await new module.default();
            component.init( componentParams );
        
        this.components.set( componentParams.id, component );
        
        return component;
    };
    
    this.addContent = ( contentParams ) => 
    {
        contents.push( contentParams );
    };

    this.addModule = async ( params ) => await importModule( params );

    this.addElement = t2.ui.addElement;
    
    this.addUnload = ( unloadParams ) => unloads.push( unloadParams );    
    
    this.modules = new Map();

    this.parameters = {};
    
    this.pause = function()
    {
        clearTimeout( self.timeout );
        delete this.timeout;
    };
    
    this.removeComponent = function( array )
    {
        array.forEach( id =>
        {
            let component = self.components.get( id );
                component.element.remove();
        } );
    };
    
    this.start = async function( movie )
    {
        console.log( "scene:", this.parameters.name );
        
        if ( this.pre )
            await this.pre();

        await load();
        
        if ( this.post )
            await this.post();

        this.timeout = setTimeout( 
            function()
            {
                if ( self.parameters.next )
                {
                    console.warn( "next", self.parameters.next );
                    self.unload();
                    movie.next( self.parameters.next );
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
            let object = ( unloadParams.namespace == "this" ) ? this : this.scripts.get( unloadParams.namespace );
            let f = object[ unloadParams.execute ];
            if ( f )
                f( unloadParams.arguments );
        } );
    };
    
    Object.assign( this.parameters, sceneParams );
    
    async function load() 
    {
        await contents.forEach( async ( params ) => importModule( params ) );
    }

    // load the module to self[ namespace ] and invoke it
    async function importModule( params )
    {
        let module   = await import( `./${ params.path }.js` );
        let instance = await new module[ params.default ]();
        let result   = await instance[ params.invoke ]( params );

        self.modules.set( params.namespace, instance );
        
        return instance;
    }
};

export default Scene;