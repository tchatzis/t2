import Handlers from "./t2.component.handlers.js";

const Component = function( module )
{
    let self = this;
    let x = 0;
    let y = 1;
    let plot = {};

    this.init = function( params )
    {
        let parent = this.parent.element;

        this.width = parent.clientWidth * 0.9;
        this.height = parent.clientHeight * 0.9;
        
        this.element = t2.common.el( "canvas", parent );
        this.element.id = params.id;
        this.element.setAttribute( "width", this.width );
        this.element.setAttribute( "height", this.height );
        
        this.ctx = this.element.getContext( "2d" );  

        Object.assign( this, params );

        Handlers.call( this );

        this.axes = new Axes();
    };

    this.addLayer = function( config )
    {
        ( !Object.keys( plot ).length )
            config.noAxes = false;
        
        this.axes.draw( config );

        plot[ config.type ]();
    };

    this.setData = function( array )
    {
        this.array = array;
    };

    const Axes = function()
    {
        let padding = 50;
        let canvas = self.ctx.canvas;

        this.chart = {};
        this.chart.limit = [ canvas.width - padding, padding ];
        this.chart.origin = [ padding, canvas.height - padding ];

        this.clear = function()
        {
            self.ctx.clearRect( 0, 0, canvas.width, canvas.height );
        };

        this.draw = function( config )
        {
            let chart = {};  

            [ x, y ].forEach( axis =>
            {    
                chart[ axis ] = scale( config.axes[ axis ] );  
                chart[ axis ].render = !config.noAxes;    
                chart[ axis ].config = config;            
                chart[ axis ].settings = config.axes[ axis ].settings;

                this.chart[ axis ] = chart[ axis ];

                axes[ axis ]();
            } );
        };
    };

    const axes = {};
        axes[ x ] = function()
        {
            let chart = self.axes.chart[ x ];
            let config = self.axes.chart;
            
            chart.size = config.limit[ x ] - config.origin[ x ];
            chart.pixels = chart.size / chart.divisions;
            
            if ( !chart.render )
                return;
            
            self.ctx.strokeStyle = "#999";
            self.ctx.fillStyle = "#999";
            
            self.ctx.beginPath(); 
            self.ctx.strokeWidth = 1;
            self.ctx.moveTo( ...config.origin );
            self.ctx.lineTo( config.limit[ x ], config.origin[ y ] );
            self.ctx.stroke();  

            for ( let p = 0; p <= chart.divisions; p++ )
            {
                let offset = ( p * chart.pixels ) + config.origin[ x ];
                let mod = chart.settings?.mod ? chart.settings.mod( p, chart ) : false;

                if ( mod )
                {    
                    let value = chart.settings?.format ? t2.formats[ chart.settings.format ]( chart.min + chart.step * p ) : chart.min + chart.step * p;
                    
                    self.ctx.save();
                    self.ctx.translate( offset, config.origin[ y ] + 10 );
                    self.ctx.textAlign = 'left';
                    self.ctx.rotate( Math.PI / 4 );
                    self.ctx.fillText( value, 0, 0 );
                    self.ctx.restore();

                    self.ctx.beginPath();
                    self.ctx.strokeStyle = "#222";
                    self.ctx.strokeWidth = 1;
                    self.ctx.moveTo( offset, config.origin[ y ] + 10 );
                    self.ctx.lineTo( offset, config.limit[ y ] );
                    self.ctx.stroke();
                }
                else
                {

                    self.ctx.beginPath();
                    self.ctx.strokeStyle = "#666";
                    self.ctx.strokeWidth = 1;
                    self.ctx.moveTo( offset, config.origin[ y ] );
                    self.ctx.lineTo( offset, config.origin[ y ] + 5 );
                    self.ctx.stroke();
                }
            }
        };

        axes[ y ] = function()
        {
            let chart = self.axes.chart[ y ];
            let config = self.axes.chart;
            
            chart.size = config.origin[ y ] - config.limit[ y ];
            chart.pixels = chart.size / chart.divisions;

            if ( !chart.render )
                return;
            
            self.ctx.strokeStyle = "#999";
            self.ctx.fillStyle = "#999";
            
            self.ctx.beginPath();
            self.ctx.strokeWidth = 1;
            self.ctx.moveTo( ...config.origin );
            self.ctx.lineTo( config.origin[ x ], config.limit[ y ] );
            self.ctx.stroke();

            for ( let p = 0; p <= chart.divisions; p++ )
            {
                let offset = -( ( p * chart.pixels ) - config.origin[ y ] );
                let mod = chart.settings?.mod ? chart.settings.mod( p, chart ) : false;
                let value = chart.settings?.format ? t2.formats[ chart.settings.format ]( chart.min + chart.step * p ) : chart.min + chart.step * p;

                if ( mod )
                {
                    self.ctx.fillText( value.toFixed( chart.precision ), 0, offset );

                    self.ctx.beginPath();
                    self.ctx.strokeStyle = "#222";
                    self.ctx.strokeWidth = 1;
                    self.ctx.moveTo( config.origin[ x ] - 10, offset );
                    self.ctx.lineTo( config.limit[ x ], offset );
                    self.ctx.stroke();
                }
                else
                {
                    self.ctx.beginPath();
                    self.ctx.strokeStyle = "#666";
                    self.ctx.strokeWidth = 1;
                    self.ctx.moveTo( config.origin[ x ], offset );
                    self.ctx.lineTo( config.origin[ x ] - 5, offset );
                    self.ctx.stroke();
                }
            } 
            
            zero( chart );
        };

    // graph types
    plot.area = function()
    {
        let chart = self.axes.chart;
        let config = self.axes.chart;
        let normalized = {};
        let bounds = 
        {
            [ x ]: config.origin[ x ],
            [ y ]: config.limit[ y ]
        };
        let last = config.origin;
        let current;

        self.ctx.beginPath();
        self.ctx.fillStyle = chart[ x ].config.color;

        self.array.forEach( ( record, r ) => 
        {
            let pixels = {};
            
            [ x, y ].forEach( axis =>
            {
                normalized[ axis ] = chart[ axis ].range ? ( record[ chart[ axis ].key ] - chart[ axis ].min ) / chart[ axis ].range : chart[ axis ].range;
                pixels[ axis ] = chart[ axis ].size * ( axis - normalized[ axis ] ) * ( axis * 2 - 1 ) + bounds[ axis ];
            } );

            current = [ pixels[ x ], pixels[ y ] ];

            self.ctx.lineTo( ...current );

            last = current
        } );

        self.ctx.lineTo( current[ x ], config.origin[ y ] );
        self.ctx.lineTo( ...config.origin );
        self.ctx.closePath();
        
        self.ctx.fill();
    }; 
    plot.bar = function()
    {
        let chart = self.axes.chart;
        let normalized = {};
        let bounds = 
        {
            [ x ]: chart.origin[ x ],
            [ y ]: chart.limit[ y ]
        };
        let size = chart[ x ].config.axes[ x ].size || chart[ x ].pixels * 0.25;

        self.ctx.fillStyle = chart[ x ].config.color;
        self.ctx.strokeWidth = 1;

        self.array.forEach( ( record, r ) => 
        {
            let pixels = {};
            
            [ x, y ].forEach( axis =>
            {
                normalized[ axis ] = chart[ axis ].range ? ( record[ chart[ axis ].key ] - chart[ axis ].min ) / chart[ axis ].range : chart[ axis ].range;
                pixels[ axis ] = chart[ axis ].size * ( axis - normalized[ axis ] ) * ( axis * 2 - 1 ) + bounds[ axis ];
            } );

            let coords = [];
                coords.push( pixels[ x ] - size );
                coords.push( chart.origin[ y ] - pixels[ y ] + chart.limit[ y ]  );
                coords.push( size * 2 );
                coords.push( pixels[ y ] - chart.limit[ y ] );

            self.ctx.beginPath();
            self.ctx.rect( ...coords );
            self.ctx.fill();
        } );
    }; 
    plot.dot = function()
    {
        let chart = self.axes.chart;
        let normalized = {};
        let bounds = 
        {
            [ x ]: chart.origin[ x ],
            [ y ]: chart.limit[ y ]
        };
        
        self.array.forEach( record => 
        {
            let pixels = {};
            
            [ x, y ].forEach( axis =>
            {
                normalized[ axis ] = chart[ axis ].range ? ( record[ chart[ axis ].key ] - chart[ axis ].min ) / chart[ axis ].range : chart[ axis ].range;
                pixels[ axis ] = chart[ axis ].size * ( axis - normalized[ axis ] ) * ( axis * 2 - 1 ) + bounds[ axis ];
            } );

            let index = module.actions.indexOf( record.action );

            self.ctx.beginPath();
            self.ctx.strokeStyle = [ "rgba( 255, 0, 0, 1 )", "rgba( 0, 255, 0, 1 )" ][ 1 - index ];
            self.ctx.arc( pixels[ x ], pixels[ y ], 4, 0, Math.PI * 2 );
            self.ctx.stroke();
        } );
    };
    plot.line = function()
    {
        let chart = self.axes.chart;
        let config = self.axes.chart;
        let normalized = {};
        let bounds = 
        {
            [ x ]: config.origin[ x ],
            [ y ]: config.limit[ y ]
        };

        self.ctx.beginPath();
        self.ctx.strokeStyle = chart[ x ].config.color;
        self.ctx.strokeWidth = 1;

        self.array.forEach( ( record, r ) => 
        {
            let pixels = {};
            
            [ x, y ].forEach( axis =>
            {
                normalized[ axis ] = chart[ axis ].range ? ( record[ chart[ axis ].key ] - chart[ axis ].min ) / chart[ axis ].range : chart[ axis ].range;
                pixels[ axis ] = chart[ axis ].size * ( axis - normalized[ axis ] ) * ( axis * 2 - 1 ) + bounds[ axis ];
            } );

            ( !r ) ? self.ctx.moveTo( pixels[ x ], pixels[ y ] ) : self.ctx.lineTo( pixels[ x ], pixels[ y ] );
        } );

        self.ctx.stroke();
    };   
    plot.step = function()
    {
        let chart = self.axes.chart;
        let normalized = {};
        let bounds = 
        {
            [ x ]: chart.origin[ x ],
            [ y ]: chart.limit[ y ]
        };
        let last = chart.origin;

        self.ctx.beginPath();
        self.ctx.strokeStyle = chart[ x ].config.color;
        self.ctx.strokeWidth = 1;
        self.ctx.moveTo( ...last );

        self.array.forEach( ( record, r ) => 
        {
            let pixels = {};
            
            [ x, y ].forEach( axis =>
            {
                if ( chart[ axis ]?.settings?.formula )
                    chart[ axis ].settings.formula( r, record );
                
                normalized[ axis ] = chart[ axis ].range ? ( record[ chart[ axis ].key ] - chart[ axis ].min ) / chart[ axis ].range : chart[ axis ].range;
                pixels[ axis ] = chart[ axis ].size * ( axis - normalized[ axis ] ) * ( axis * 2 - 1 ) + bounds[ axis ]; 
            } );

            let current = [ pixels[ x ], pixels[ y ] ];
            //let index = module.data.actions.indexOf( record.action );

            self.ctx.lineTo( current[ x ], last[ y ] );
            self.ctx.lineTo( ...current );
            
            last = current;
        } );

        self.ctx.stroke();
    };     

    function scale( config )
    { 
        let params = {};
            params.key = config.axis;
            params.array = self.array.map( item => item[ params.key ] );
            params.min = Math.floor( Math.min.apply( null, params.array ) );
            params.max = Math.ceil( Math.max.apply( null, params.array ) );  
            params.range = params.max - params.min;
            params.log = Math.floor( Math.log10( params.range ) ); 
            params.precision = Math.max( 4 - params.log, 0 );
            params.step = config.settings.step || Math.pow( 10, 3 - params.precision );
            params.divisions = Math.ceil( params.range / params.step );
            params.zero = ( 1 - ( 0 - params.min ) / params.range ) * params.divisions; 

        return params;
    }

    function zero( chart )
    {
        let config = self.axes.chart;
        let offset = chart.zero * chart.pixels + config.limit[ y ];
        
        if ( chart.zero < chart.max )
        {
            self.ctx.beginPath();
            self.ctx.strokeStyle = "red";
            self.ctx.strokeWidth = 1;
            self.ctx.moveTo( config.origin[ x ] - 10, offset );
            self.ctx.lineTo( config.limit[ x ], offset );
            self.ctx.stroke();
        }
    }
};

export default Component;