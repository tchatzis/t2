import Scene from "./movie.scene.js";

const Movie = function()
{
    let self = this;
    
    this.addScene = function( sceneParams )
    {
        let scene = new Scene( sceneParams );

        this.scenes.set( scene.parameters.name, scene );

        return this.scenes.get( scene.parameters.name );
    };
    
    this.editScene = function( name, config )
    {
        let scene = this.scenes.get( name );

        for( let key in config )
            scene[ key ] = config[ key ];
    };

    this.next = function( name )
    {
        this.scene = this.scenes.get( name );
        
        if ( this.scene )
            this.scene.start( this );  
        else
            console.error( name, "is not defined" );
    };
    
    this.scenes = new Map();                     
};

export default Movie;