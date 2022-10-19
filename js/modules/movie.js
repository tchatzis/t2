import Scene from "./movie.scene.js";

const Movie = function()
{
    let self = this;
    
    this.addScene = function( sceneParams )
    {
        let scene = new Scene( sceneParams );

        self.scenes.set( scene.parameters.name, scene );

        return scene;
    };

    this.changeScene = async function( name )
    {
        let scene = t2.movie.scenes.get( name );

        await scene.start();
    };

    this.editScene = function( name, config )
    {
        let scene = self.scenes.get( name );

        for( let key in config )
            scene[ key ] = config[ key ];
    };

    this.resetScene = function()
    {
        t2.common.clear( Array.from( t2.ui.children.keys() ) );
    };

    this.nextScene = function( name )
    {
        let scene = self.scenes.get( name );
        
        if ( scene )
            scene.start( self );  
        else
            console.error( name, "is not defined" );
    };
    
    this.scenes = new Map();                     
};

export default Movie;