const Settings = function()
{
    const scope = this;
    let count = 0;
    
    console.log( this );
    
    this.animations = 
    {
        queued: [],
        paused: []
    };
    this.animations.run = function()
    {
        this.animations.queued.forEach( animation => animation.f( count ) );
        
        requestAnimationFrame( scope.animations.run );
        
        count++; 
    };
}

export default Settings;