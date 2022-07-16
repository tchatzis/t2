const Animations = function()
{
    const scope = this;
    
    function transmit( type, animation )
    {
        let event = new CustomEvent( type, { detail: animation } );

        dispatchEvent( event );
    }
    
    this.name = "animations";

    this.animate = function()
    {
        if ( scope.queued.length )
        {
            let now = Date.now();
            
            scope.queued.forEach( ( animation, index ) => 
            {
                let conditions = [];
                    conditions.push( ( animation.start + animation.duration ) > now );
                    conditions.push( animation.limit > animation.count ); 
                    conditions.push( animation.animate ); 
                    conditions.push( animation.name ); 
                    conditions.push( animation.f ); 
                
                //if ( scope.frame < 10 )
                    transmit( "animations", animation );        

                if ( conditions.every( bool => bool ) )
                    animation.f( scope.frame );    
            } );

            requestAnimationFrame( scope.animate );
        
            scope.frame++; 
        }
    };
    
    this.index = () => this.queued.findIndex( a => a.name == this.name );
    
    this.init = function()
    {
        this.reset();
        
        //this.queued = animations;
        
        //this.animate();
    };
    
    this.pause = function()
    {
        let paused = this.stop();
        this.paused.push( paused );
    };
    
    this.reset = function()
    {
        this.frame = 0;
        this.queued = [];
        this.paused = [];
    };
     
    this.resume = function()
    {
        this.paused.forEach( animation => this.start( animation ) );
    };
    
    this.remove = function( index )
    {
        return this.queued.splice( index, 1 );
    };
    
    this.start = function( animation )
    {
        let index = this.index();
        
        if ( index > -1 )
            this.paused.splice( index, 1 );
        
        this.queued.push( animation );
    };
    
    this.stop = function()
    {
        let index = this.index();
        
        if ( index > -1 )
            return this.remove( index );
    };
}

export default Animations;