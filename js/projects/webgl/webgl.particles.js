const Template = function( module )
{
    let self = this;
    
    this.init = async function()
    {
        await this.refresh();

        await navigation();
    };

    this.refresh = async function()
    {

    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "content", functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
        ] );
    } 

    async function output()
    {
        let canvas = await this.addComponent( { id: "particles", type: "canvas", format: "2d" } );
        let NX = canvas.element.width;
        let NY = canvas.element.height;
        let N = NX * NY / 10;
        let ctx = canvas.ctx;   
            ctx.globalCompositeOperation = "overlay"; 

        let particle1 = new Particle( { mass: 1, name: "particle1" } );
        let particle2 = new Particle( { mass: 2, name: "particle2" } );
            particle2.position = new Vector( 3, 4, 5 );
            particle2.gravitate( particle1 );
        //console.log( particle1 );
        //console.warn( particle2 );

        function animate()
        {

        }

        //animate();
    }   

    const Vector = function( x, y, z )
    {
        let axes = [ "x", "y", "z" ];
        
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    
        this.add = ( vector ) =>
        {
            let result = new Vector();
            
            axes.forEach( axis => 
            {
                result[ axis ] = this[ axis ] + vector[ axis ];
            } );

            return result;
        };

        this.clone = ( vector ) =>
        {
            return { ...vector };
        };

        this.cross = ( vector ) => 
        {
            return new Vector( this.y * vector.z - this.z * vector.y, this.z * vector.x - this.x * vector.z, this.x * vector.y - this.y * vector.x );
        };
        
        this.distance = ( vector ) => 
        {
            let temp = 0;
            
            axes.forEach( axis => 
            {
                temp += Math.pow( this[ axis ] + vector[ axis ], 2 );
            } );

            return Math.sqrt( temp );
        };

        this.dot = ( vector ) =>
        {
            let result = new Vector();
            
            axes.forEach( axis => 
            {
                result[ axis ] = this[ axis ] * vector[ axis ];
            } );

            return result;
        };

        this.lerp = ( vector, scalar ) =>
        {
            let result = new Vector();
            
            axes.forEach( axis => 
            {
                result[ axis ] -= ( this[ axis ] - vector[ axis ] ) * scalar;
            } );

            return result;
        };

        this.round = ( precision ) =>
        {
            let pow = Math.pow( 10, precision );
            let result = new Vector();
            
            axes.forEach( axis => 
            {
                result[ axis ] = Math.round( this[ axis ] * pow ) / pow;
            } );

            return result;
        };

        this.subtract = ( vector ) =>
        {
            let result = new Vector();
            
            axes.forEach( axis => 
            {
                result[ axis ] = this[ axis ] - vector[ axis ];
            } );

            return result;
        };

    };

    const Timer = function( lifespan )
    {
        let ms = 1000;
        let timer = this;
        let subscribers = new Map();

        const broadcast = function()
        {
            subscribers.forEach( ( callback, obj ) => callback( { obj: obj, timer: timer } ) );
        };

        this.pause = function()
        {
            timer.running = false;
        };

        this.reset = function()
        {
            timer.initial = Date.now();
            timer.current = timer.initial; 
            timer.elapsed = 0;
            timer.normal = 0;
            timer.tick = 0;
            timer.count = 0;
            timer.last = null;
            timer.normal = 0;
            timer.running = false;
            timer.range = 0;
            timer.end = null;
            timer.uuid = t2.common.uuid();
        };

        this.resume = function()
        {
            timer.running = true;
        };

        this.run = function()
        {
            if ( !timer.running )
                return;

            broadcast( timer );
            
            timer.elapsed = ( timer.current - timer.initial ) / ms;
            timer.normal = timer.elapsed * ms / timer.range;
            timer.last = timer.current;
            timer.current = Date.now();
            timer.tick = timer.current - timer.last;
            timer.count++;

            if ( timer.current <= timer.end )
                requestAnimationFrame( timer.run );
        };

        this.start = function( time )
        {    
            let lifespan = time * ms || Infinity;
            
            timer.end = timer.initial + lifespan;
            timer.range = timer.end - timer.initial;

            this.resume();
            this.run();
        };

        this.stop = function()
        {
            this.pause();
            this.reset();
        };

        this.subscribe = function( obj, callback )
        {
            subscribers.set( obj, callback );
        };

        this.toggle = function()
        {
            timer.running = !timer.running;
        };

        this.unsubscribe = function( obj )
        {
            subscribers.delete( obj );
        };

        this.reset();
    };

    const Particle = function( params )
    {
        params = params || {};

        let self = this;
        let G = 1;//6.67 * Math.pow( 10, -11 );

        Object.assign( this, params );

        this.uuid = t2.common.uuid();
        this.position = this.position || new Vector();
        this.mass = this.mass || 0;
        this.radius = this.radius || 1;
        this.gravity = ( G * this.mass ** 2 ) / ( this.radius ** 2 );

        this.gravitate = ( particle ) => 
        { 
            let distance = this.position.distance( particle.position );
            let time = Math.sqrt( ( distance * 2 ) / ( this.gravity + particle.gravity ) );
            let timer = new Timer();
                timer.start( time );
                timer.subscribe( particle, update );

            //console.warn( time, distance );

            function update( detail )
            {
                let t = time * detail.timer.normal;
                let d = 0.5 * G * t ** 2;
                //console.log( d );
                
                //let result = self.position.lerp( particle.position, detail.timer.normal );
                
                //console.warn( result.round( 4 ), detail.timer.normal )
            }
        };
    };
};

export default Template;