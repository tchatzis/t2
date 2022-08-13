import { aggregate, reset, total } from "./trades.aggregate.js";
import totals from "./trades.totals.js";

const Timeline = function( module )
{
    let self = this;

    this.init = async function()
    {
        if ( !module.symbol )
            return;

        let map = new Map();

        // filter by symbol and no dividends
        this.array = module.data.all.filter( record => ( record.symbol == module.symbol && record.action !== "DIV" ) );
        this.array.forEach( record =>
        {
            let date = t2.formats.date( record.date );
            
            if ( !map.has( date ) )
                map.set( date, [] );

            map.get( date ).push( record );
        } );

        // begin chart
        let x = 0;
        let y = 1;
        let chart = {};
        let points = {};
        let values = {};


        // set up canvas and context
        let parent = t2.ui.elements.get( "content" );
        let h = parent.offsetHeight;
        let w = parent.offsetWidth;
        
        let canvas = t2.common.el( "canvas", parent );
            canvas.setAttribute( "height", h );
            canvas.setAttribute( "width", w );
        let ctx = canvas.getContext( "2d" );
    
        let padding = 50;
        let limit = [ w - padding * 2, padding ];
        let origin = [ padding, h - padding ];

        ctx.fillStyle = "white";
        ctx.font = '12px sans-serif';

        // domain
        let dates = [];
        let events = t2.common.dates( Array.from( map.keys() ) );
            events.forEach( date =>
            {
                date = t2.formats.date( date );
                
                points[ date ] = [];
                values[ date ] = 0;
                dates.push( { date: new Date( date ) } );
                
                let transactions = map.get( date );
                    transactions.forEach( record =>
                    {
                        let point = {};
                            point.date = new Date( record.date ).getTime();
                            point.price = record.price;
                            point.qty = record.qty;

                        values[ date ] += record.value;

                        points[ date ].push( point );
                    } );
            } );

        chart[ x ] = scale( "date", dates );

        // range
        chart[ y ] = scale( "price", this.array );

        function xAxis()
        {
            // x axis
            ctx.beginPath();
            ctx.strokeStyle = "silver";
            ctx.strokeWidth = 1;
            ctx.moveTo( ...origin );
            ctx.lineTo( limit[ x ], origin[ y ] );
            ctx.stroke();
            
            let step = 1000 * 60 * 60 * 24;
            let divisions = chart[ x ].range ? chart[ x ].range / step : 1; 

            chart[ x ].size = limit[ x ] - origin[ x ];

            let pixels = chart[ x ].size / divisions;

            for ( let p = 0; p <= divisions; p++ )
            {
                let offset = ( p * pixels ) + origin[ x ];
                
                let date = new Date( chart[ x ].min );
                    date.setDate( date.getDate() + p );

                if ( !date.getDay() || !p || p == divisions )
                {    
                    let value = t2.formats.date( date );

                    ctx.save();
                    ctx.translate( offset, origin[ y ] + 10 );
                    ctx.textAlign = 'left';
                    ctx.rotate( Math.PI / 4 );
                    ctx.fillText( value, 0, 0 );
                    ctx.restore();

                    ctx.beginPath();
                    ctx.strokeStyle = "#222";
                    ctx.strokeWidth = 1;
                    ctx.moveTo( offset, origin[ y ] + 10 );
                    ctx.lineTo( offset, limit[ y ] );
                    ctx.stroke();
                }
                else
                {

                    ctx.beginPath();
                    ctx.strokeStyle = "#666";
                    ctx.strokeWidth = 1;
                    ctx.moveTo( offset, origin[ y ] );
                    ctx.lineTo( offset, origin[ y ] + 5 );
                    ctx.stroke();
                }
            }
        }

        function yAxis()
        {
            // y axis
            ctx.beginPath();
            ctx.strokeStyle = "silver";
            ctx.strokeWidth = 1;
            ctx.moveTo( ...origin );
            ctx.lineTo( origin[ x ], limit[ y ] );
            ctx.stroke();

            chart[ y ].size = origin[ y ] - limit[ y ];
            
            let pixels = chart[ y ].size / chart[ y ].divisions;

            for ( let p = 0; p <= chart[ y ].divisions; p++ )
            {
                let offset = -( ( p * pixels ) - origin[ y ] );

                if ( !( p % 10 ) )
                {
                    let value = chart[ y ].min + chart[ y ].step * p;

                    ctx.fillText( value.toFixed( chart[ y ].precision ), 0, offset );

                    ctx.beginPath();
                    ctx.strokeStyle = "#222";
                    ctx.strokeWidth = 1;
                    ctx.moveTo( origin[ x ] - 10, offset );
                    ctx.lineTo( limit[ x ], offset );
                    ctx.stroke();
                }
                else
                {
                    ctx.beginPath();
                    ctx.strokeStyle = "#666";
                    ctx.strokeWidth = 1;
                    ctx.moveTo( origin[ x ], offset );
                    ctx.lineTo( origin[ x ] - 5, offset );
                    ctx.stroke();
                }
            }
        }

        function dot( points, X, Y )
        {
            for ( let point in points )
            {
                let array = points[ point ];
                    array.forEach( value =>
                    {
                        let fx = chart[ x ].range ? ( value[ X ] - chart[ x ].min ) / chart[ x ].range : chart[ x ].range;
                        let fy = chart[ y ].range ? ( value[ Y ] - chart[ y ].min ) / chart[ y ].range : chart[ x ].range;

                        let px = fx * chart[ x ].size + origin[ x ];
                        let py = ( 1 - fy ) * chart[ y ].size + limit[ y ];

                        let index = value.qty ? Math.sign( value.qty ) : 0;

                        ctx.beginPath();
                        ctx.strokeStyle = [ "rgba( 255, 0, 0, 0.5 )", "yellow", "rgba( 0, 255, 0, 0.5 )" ][ index + 1 ];
                        ctx.arc( px, py, 4, 0, Math.PI * 2 );
                        //ctx.fillText( `${ value.qty } @ ${ value.price.toFixed( chart[ y ].precision ) }`, px + 5, py );
                        ctx.stroke();

                        if ( isNaN( px ) || isNaN( py ) )
                            console.error( point, px, py, chart );
                    } );
            }
        }

        xAxis();
        yAxis();
        dot( points, "date", "price" );
        reset();
        aggregate( module.symbol, this.array );
        totals( total );
    };

    function scale( key, array )
    { 
        let params = {};
            params.key = key;
            params.data = array.sort( ( a, b ) => a[ key ] > b[ key ] ? 1 : -1 );
            params.array = params.data.map( item => item[ key ] );
            params.min = Math.floor( Math.min.apply( null, params.array ) );
            params.max = Math.ceil( Math.max.apply( null, params.array ) );   
            params.range = params.max - params.min;

        let log = Math.floor( Math.log10( params.max ) );
            
            params.step = 1;
            params.precision = 4 - log;
            params.step = Math.pow( 10, 2 - params.precision );
            params.divisions = params.range / params.step;

        return params;
    }
};

export default Timeline; 