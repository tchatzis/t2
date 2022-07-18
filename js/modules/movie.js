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

    this.editScene = function( name, config )
    {
        let scene = self.scenes.get( name );

        for( let key in config )
            scene[ key ] = config[ key ];
    };

    this.next = function( name )
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