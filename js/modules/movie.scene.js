const Scene = function( sceneParams )
{
    let self = this;
    let contents = [];
    let unloads = [];

    //this.components = new Map();
    this.name = sceneParams.name;

    // forms, html
    this.addContent = ( contentParams ) => contents.push( contentParams );

    this.addModule = async ( params ) => await importModule( params );

    this.addElement = t2.ui.addElement;

    /*this.addUI = async function( componentParams )
    {
        componentParams.parent = t2.common.getParent( componentParams );

        let module    = await import( `../t2/t2.ui.${ componentParams.component }.js` );
        let component = await new module.default();
            component.init( componentParams );

        t2.ui.components.set( componentParams.id, component );
        
        return component;
    };*/

    this.addUnload = ( unloadParams ) => unloads.push( unloadParams );  

    this.change = async function()
    {
        self.reset();
        
        let active = arguments[ 2 ];
        let link = active.curr;
        let name = link.textContent;
        let scene = t2.movie.scenes.get( name );
        await scene.start();
    };

    this.modules = new Map();

    this.parameters = {};
    
    this.pause = function()
    {
        clearTimeout( self.timeout );
        delete this.timeout;
    };
    
    this.removeComponents = function( array )
    {
        array.forEach( id =>
        {
            let component = t2.ui.components.get( id );
                component.element.remove();
        } );
    };

    this.removeElement = function( element )
    {
        element.remove();
    };

    this.reset = function()
    {
        //console.trace( Array.from( t2.ui.elements.keys() ) )
        t2.common.clear( Array.from( t2.ui.elements.keys() ) );
    };

    this.start = async function()
    {
        console.log( `%c scene: ${ self.parameters.name } ${ self.parameters.duration }`, "background: green;" );
        
        // excute the script
        if ( self.parameters.script )
            await self.parameters.script.call( self );

        if ( self.pre )
            await self.pre();

        await load();

        if ( self.post )
            await self.post();

        // TODO: devise a better hook
        let menu = t2.ui?.components.get( "movies" );

        if ( menu )
            menu.activate( self.parameters.name );

        if ( self.parameters.duration < Infinity )
            self.timeout = setTimeout( 
                function()
                {
                    if ( self.parameters.next )
                    {
                        self.unload();
                        t2.movie.next( self.parameters.next );
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
                f( unloadParams.arguments );
        } );
    };
    
    Object.assign( this.parameters, sceneParams );
    
    async function load() 
    {
        Promise.all( contents.map( async ( params ) => await importModule( params ) ) );
    }

    // load the module to self[ namespace ] and invoke it
    async function importModule( params )
    {
        let module   = await import( `./${ params.path }.js` );
        let instance = await new module[ params.default ]( params.arguments );

        // invoke the function
        await instance[ params.invoke ]( params );

        self.modules.set( params.namespace, instance );
        
        return instance;
    }
};

export default Scene;