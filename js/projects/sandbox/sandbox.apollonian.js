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
        let canvas = await this.addComponent( { id: "apollonian", type: "canvas", format: "2d" } );
        let NX = canvas.element.width;
        let NY = canvas.element.height;
        let N = NX * NY / 10;
        let ctx = canvas.ctx;   
            ctx.globalCompositeOperation = "overlay"; 

        function apollon( params )
        {
            ctx.clearRect( 0, 0, NX, NY );
            
            let e = params.blur || 3;
            let r = Math.sqrt( e );
            let x = params.x || 0;
            let y = params.y || 0;
            let SCALE = Math.min( NX, NY ) / ( params.scale || 8 );
            let dot = params.dot || 1;

            for ( let n = 0; n < N; n++ ) 
            {
                let x1 = 0;
                let y1 = 0;
                let m = ( Math.pow( 1 + r - x, 2 ) + y * y );
                let a0 = e * ( 1 + r - x ) / m - ( 1 + r ) / ( 2 + r );
                let b0 = e * y / m;
                let d = ( a0 * a0 + b0 * b0 );
                let f1x =  a0 / d;
                let f1y = -b0 / d;
                let rand = Math.floor( Math.random() * 3 );

                switch ( rand ) 
                {
                    case 0:
                        x1 = a0;
                        y1 = b0;
                    break;

                    case 1:
                        x1 = -f1x / 2 - f1y * r / 2;
                        y1 = f1x * r / 2 - f1y / 2;
                    break;

                    case 2:
                        x1 = -f1x / 2 + f1y * r / 2;
                        y1 = -f1x * r / 2 - f1y / 2;
                    break;
                }

                if ( n < 100 )
                continue;

                let ix = x * SCALE + NX / 2;
                let iy = y * SCALE + NY / 2;
                x = x1;
                y = y1;

                if ( ix < 0 || iy < 0 || ix >= NX || iy >= NY )
                    continue;

                ctx.fillStyle = `hsla( ${ ( n % ( params.range || 360 ) ) + ( params.start || 0 ) }, 100%, 30%, 1 )`;
                ctx.fillRect( Math.round( ix ), Math.round( iy ) , dot, dot );
            }
        }

        let s = 0;

        function animate()
        {
            //let f = requestAnimationFrame( animate );
            //let a = f / 1000;
            //let b = ( ( f * 0.01 ) % 2 );
            
            //let i = s++;
            
            apollon( { blur: 3, dot: 1, scale: 8, start: 15, range: 60 } );  
        }

        animate();
    }   
};

export default Template;