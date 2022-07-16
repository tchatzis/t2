const Transformations = function()
{
    var config = {};
    
    function Config( params )
    {
        this.amount = params.amount || 0;
        this.axis = params.axis || [];
        this.count = 0;
        this.delay = params.delay || 0;
        this.duration = params.hasOwnProperty( "duration" ) ? params.duration : Infinity;
        this.limit = params.hasOwnProperty( "limit" ) ? params.limit : Infinity;
        this.name = params.name || "";
        this.normalize = !!params.normalize;
        this.oscillate = !!params.oscillate;
        this.start = Date.now();
        this.uid = this.start.toString( 32 );
        
        this.animate = [ this.amount, this.duration, this.limit, this.name ].every( ( bool ) => !!bool );
        
        this.set = ( key, value ) => this[ key ] = value;
    }
    
    /*function center( data )
    {
        let object = {};
        let config = this.getConfig();
        let params = [ "x", "y", "cx", "cy" ];
        let midpoint = config.midpoint;
        let centering = new Map();
        let map = new Map();
            map.set( "angle", "angle" );
            map.set( "x", "x" );
            map.set( "y", "y" );
            map.set( "cx", "x" );
            map.set( "cy", "y" );

        params.forEach( ( param, index ) =>
        {
            object[ param ] = data[ index ] || 0;   
            
            let prop = map.get( param );
            let offset = {};
            
            if ( object.hasOwnProperty( prop ) )
            { 
                switch( prop )
                {
                    case "x":
                        config[ prop ] = config[ param ] || 0;
                        offset[ prop ] = this.type == "text" ? midpoint[ prop ] : 0;

                        if ( config[ prop ] !== undefined )
                            centering.set( prop, config[ prop ] + offset[ prop ] || object[ prop ] );
                    break;

                    case "y":
                        config[ prop ] = config[ param ] || 0;
                        offset[ prop ] = this.type == "text" ? midpoint[ prop ] / 2 : 0;

                        if ( config[ prop ] !== undefined )
                            centering.set( prop, config[ prop ] - offset[ prop ] || object[ prop ] );
                    break;  
                }
            }
        } );

        return centering;
    }*/

    function check( a )
    {
        return !!config.axis.find( axis => axis == a );
    }

    function increment()
    {
        let count = config.count++;
        let sin = Math.sin( Math.PI * count / 180 );
        let value = this.normalize ? ( sin + 1 ) / 2 - 1 : sin;
        
        return this.oscillate ? value : count;
    }
    
    function name( operation, config )
    {
        config.set( "parent", this.name );
        config.set( "operation", operation );
    }
    
    function setConfig( params )
    {
        return ( config instanceof Config ) ? config : new Config( params );
    }
    
    // transformations
    function stop( params )
    {
        let f = () => 
        {
            setTimeout( () => 
            { 
                let index = this.animations.findIndex( a => a.name == config.name );

                if ( index > -1 )
                    this.animations.splice( index, 1 );

            }, params.delay || 0 );
        };

        f();

        return f;
    }

    function rotate()
    {
        let data = [ ...arguments ];
        let angle = data[ 0 ] || 0;
        let a = ( config.amount || 1 );
        let midpoint = this.getConfig( "midpoint" );

        name.call( this, "rotate", config );

        this.setAttribute( "transform-origin", `${ midpoint.x } ${ midpoint.y }` );

        let f = () => 
        {   
            let value = Number( angle ) + increment.call( config ) * a;

            this.setAttribute( "transform", `rotate( ${ value } )` );
            config.value = value;
        };
        
        f( 0 );
        
        return f;        
    }
    
    function scale()
    {
        let data = [ ...arguments ];
        let sx = data[ 0 ] || 1;
        let sy = data[ 1 ] || 1;
        let a = ( config.amount || 1 );
        let midpoint = this.getConfig( "midpoint" );
        
        config.normalize = true;
        
        name.call( this, "scale", config  );

        this.setAttribute( "transform-origin", `${ midpoint.x } ${ midpoint.y }` );

        let f = () => 
        {   
            let i = increment.call( config ) * a;
            let vx = check( "x" ) ? Number( sx ) + i : 1;
            let vy = check( "y" ) ? Number( sy ) + i : 1;

            this.setAttribute( "transform", `scale( ${ vx } ${ vy } )` );
            config.value = { x: vx, y: vy };
        };
        
        f( 0 );
        
        return f;          
    }
    
    function skew()
    {
        let data = [ ...arguments ];
        let sx = data[ 0 ] || 0;
        let sy = data[ 1 ] || 0;
        let a = ( config.amount || 1 );
        let midpoint = this.getConfig( "midpoint" );
        
        name.call( this, "skew", config  );

        this.setAttribute( "transform-origin", `${ midpoint.x } ${ midpoint.y }` );

        let f = () => 
        {   
            let i = increment.call( config ) * a;
            let vx = check( "x" ) ? Number( sx ) + i : 0;
            let vy = check( "y" ) ? Number( sy ) + i : 0;

            if ( check( "x" ) )
                this.setAttribute( "transform", `skewX( ${ vx } )` );
            
            if ( check( "y" ) )
                this.setAttribute( "transform", `skewY( ${ vy } )` );
            
            config.value = { x: vx, y: vy };
        };
        
        f( 0 );
        
        return f;          
    }
    
    function translate()
    {
        let data = [ ...arguments ];
        let sx = data[ 0 ] || 1;
        let sy = data[ 1 ] || 1;
        let a = ( config.amount || 1 );
        let midpoint = this.getConfig( "midpoint" );
        
        name.call( this, "translate", config  );

        this.setAttribute( "transform-origin", `${ midpoint.x } ${ midpoint.y }` );

        let f = () => 
        {   
            let i = increment.call( config ) * a;
            let vx = check( "x" ) ? Number( sx ) + i : 0;
            let vy = check( "y" ) ? Number( sy ) + i : 0;

            this.setAttribute( "transform", `translate( ${ vx } ${ vy } )` );
            config.value = { x: vx, y: vy };
        };
        
        f( 0 );
        
        return f;           
    }
    
    
    // single operations
    this.oscillate = function( params )
    {
        let f = this[ params.transform ]( params );
        
        config = setConfig( params );
        config.f = f;

        return f;
    };

    this.rotate = function( params )
    {
        config = setConfig( params );
        return rotate.call( this, params.amount );
    };
    
    this.scale = function( params )
    {
        config = setConfig( params );
        return scale.call( this, params.amount, params.amount );   
    };
    
    this.skew = function( params )
    {
        config = setConfig( params );
        return skew.call( this, params.amount, params.amount );  
    };
    
    this.translate = function( params )
    {
        config = setConfig( params );
        return translate.call( this, params.amount, params.amount ); 
    };
    
    
    // auto animate operations
    this.oscillation = function( params )
    {
        params.oscillate = true;
        
        let f = this.oscillate( params );
        
        config = setConfig( params );
        config.f = f;
        
        return f;
    };    
    
    this.rotation = function( params )
    { 
        let f = this.rotate( params );
        
        config = setConfig( params );
        config.f = f;
        
        this.setAnimation( config );
        
        return f;
    };
    
    this.scalation = function( params )
    { 
        let f = this.scale( params );
        
        config = setConfig( params );
        config.f = f;
        
        this.setAnimation( config );
        
        return f;
    };
    
    this.skewation = function( params )
    { 
        let f = this.skew( params );
        
        config = setConfig( params );
        config.f = f;
        
        this.setAnimation( config );
        
        return f;
    };

    this.translation = function( params )
    { 
        let f = this.translate( params );
        
        config = setConfig( params );
        config.f = f;
        
        this.setAnimation( config );
        
        return f;
    };
    
    this.stop = function( params )
    {
        stop.call( this, params );     
    };
} 

export default Transformations;