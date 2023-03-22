import Common from "../../t2/t2.container.handlers.js";
import Draw from "../../modules/draw.js";

const Panel = function( module )
{
    let self = this;
    let use = {};
    let axes = [ "x", "y", "z" ];
    
    let draw = new Draw();
    let drawing = false;
    let pixels;
    let list;
    let tree;
    let panel;
    let crosshairs;
    let picker;
    let submenu = t2.ui.children.get( "submenu" );
    let margin = t2.ui.children.get( "margin" );
    let subcontent = t2.ui.children.get( "subcontent" );
    let map = new Map();

    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );
 
        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );
    };

    this.refresh = async function()
    {
        this.start = { x: 0, y: 0 };
        this.end = { x: 0, y: 0 };
        this.config = {};
        
        await module.queries(); 

        await navigation();
    }; 

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "submenu", functions: [ { ignore: "clear" }, { clear: null }, { hide: null }, { invoke: [ { f: color, args: null } ] } ] }, 
            { id: "subcontent", functions: [ { ignore: "clear" }, { clear: null } ] },
            { id: "submargin", functions: [ { ignore: "clear" }, { clear: null } ] },
            { id: "menu", functions: [ { ignore: "clear" }, { clear: null }, { invoke: [ { f: menu, args: null } ] } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] },
        ] );
    } 

    /****************************************************************/

    const Layer = function( params )
    {
        Object.assign( this, params );
    };

    const convert =
    {
        fromVector: ( vector ) =>
        {
            switch ( use.view )
            {
                case "top":
                    return { x: vector.x, y: vector.z };
            }
        }, 
        snapPixel: ( value ) => Math.round( convert.toUnit( value ) ) * pixels,
        snapPixels: ( array ) =>
        {
            return array.map( value => convert.snapPixel( value ) );
        },
        toPixel: ( value ) => value * pixels,
        toPixels: ( vector ) => 
        {
            let converted = {};

            Object.entries( vector ).forEach( component => 
            {
                let [ key, value ] = component;

                if ( ~axes.indexOf( key ) )
                    converted[ key ] = convert.toPixel( value );
            } );

            return converted;
        },
        toSnap: ( vector ) => 
        {
            let converted = {};

            Object.entries( vector ).forEach( component => 
            {
                let [ key, value ] = component;

                if ( ~axes.indexOf( key ) )
                    converted[ key ] = Math.round( convert.toUnit( value ) );
            } );

            return converted;
        },
        toUnit: ( value ) => 
        {
            let precision = module.record.grid.precision;
            let pow = 1 / precision;
            
            return Math.round( pow * value / pixels ) / pow;
        },
        toVector: ( point ) =>
        {
            switch ( use.view )
            {
                case "top":
                    return snap( { x: point[ 0 ], y: 0, z: point[ 1 ] } );
            }
        },
        rect: ( points ) => 
        {
            let point = [];
            let vectors = [];

            points.forEach( ( value, i ) => 
            {
                let _x = Math.floor( i / 2 );
                let _y = ( ( _x + i ) % 2 );
                let x = _x * 2;
                let y = _y * 2 + 1;
                let offset = [ points[ 0 ] * _x, points[ 1 ] * _y ];

                point = [ points[ x ] + offset[ 0 ], points[ y ] + offset[ 1 ] ];

                vectors.push( convert.toVector( point ) );
            } );

            vectors.push( vectors[ 0 ] );

            return vectors;
        }
    };

    // component handlers switch
    function listen( e )
    {
        handlers[ e.type ]( e.detail );
    }

    // component handlers
    const handlers =
    {
        // branch
        addBranch: async ( detail ) => 
        {
            module.record.layers = module.record.layers || [];

            let layer;
            let existing = module.record.layers.find( item => ( item.parent == detail.label && item.label == detail.branch.label ) );
            let d = { ...detail.branch.detail };
            let uuid = d.uuid;
            let canvas = await this.addComponent( { id: d.label, type: "canvas", format: "2d" } );
                canvas.element.style.position = "absolute";

            if ( existing )
            {
                layer = existing; 
            }
            else
            {
                layer = new Layer( { array: [], label: detail.branch.label, parent: detail.label, config: { visible: true } } );

                module.record.layers.push( layer );
                
                await handlers.updateData();
            }

            map.set( uuid, { canvas: canvas, detail: d, layer: layer } );  
        },
        changeParent: async ( detail ) =>
        {
            console.warn( detail );
        },
        renameBranch: async ( detail ) =>
        {
            let item = module.record.layers.find( item => ( item.parent == detail.parent && item.label == detail.original ) );
                item.label = detail.label;

            let children = module.record.layers.filter( item => ( item.parent == detail.original ) );
                children.forEach( child => child.parent = detail.label );

            await handlers.updateData();
        },
        selectBranch: async ( detail ) => 
        {
            margin.clear();
            subcontent.clear();

            use.map = map.get( detail.uuid );

            if ( !detail.root && use.map.layer )
            {   
                submenu.show();
                picker.update( use.map.layer.config.color );
                await icons();
                await input();  
            }
            else
                submenu.hide();

            /*
            let layers = [ ...module.record.layers ];
            let length = layers.length;

            while ( length > 0 )
            {
                length--;

                let item = module.record.layers[ length ];

                if ( [ "counters", "post stairwell" ].includes( item.label ) )
                {
                    module.record.layers.splice( length, 1 );
                } 
            }

            handlers.updateData();*/
        },
        // data
        convertData: () => use.map.converted = use.map.layer.array.map( vector => convert.toPixels( vector ) ),
        updateData: async () => await t2.db.tx.update( module.q.table, Number( module.record.id ), module.record ),
    };

    // mouse event handlers
    const mouse = 
    {
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 },
        points: [],
        
        mousedown:
        {
            dot:        () => self.initial.inputs.get( "add" ).click(),
            polyline:   () => self.initial.inputs.get( "add" ).click(),
            rect:       () => 
            {
                mouse.start = { x: mouse.x, y: mouse.y };

                drawing = true;  
            }
        },
        
        mousemove:
        {     
            dot:      broadcast,
            polyline: broadcast,
            rect: () =>
            {
                if ( drawing )
                {
                    mouse.end = { x: mouse.x, y: mouse.y };

                    mouse.points = plot();

                    broadcast( [ mouse.end.x - mouse.start.x, mouse.end.y - mouse.start.y ] );
                }
            }
        },

        mouseup:
        {
            circle: () =>
            {
                mouse.end = { x: mouse.x, y: mouse.y };

                drawing = false;

                list.readOnly( true );
                list.update( { array: [ convert.toVector( [ mouse.start.x, mouse.start.y ] ), convert.toVector( [ mouse.end.x, mouse.end.y ] ) ] } );

                broadcast( [ 0, 0 ] );

                use.map.layer.array = list.array;

                update();
            },
            polyline: () =>
            {
                drawing = false;
            },
            rect: () =>
            {
                mouse.end = { x: mouse.x, y: mouse.y };

                drawing = false;

                list.readOnly( true );
                list.update( { array: convert.rect( mouse.points ) } );

                broadcast( [ mouse.end.x - mouse.start.x, mouse.end.y - mouse.start.y ] );

                use.map.layer.array = list.array;

                update();
            }
        }
    };

    mouse.mousedown.bezier = mouse.mousedown.polyline;
    mouse.mousemove.bezier = mouse.mousemove.polyline;
    mouse.mouseup.bezier = mouse.mouseup.polyline;

    mouse.mousedown.circle = mouse.mousedown.rect;
    mouse.mousemove.circle = mouse.mousemove.rect;

    mouse.mousedown.quadratic = mouse.mousedown.polyline;
    mouse.mousemove.quadratic = mouse.mousemove.polyline;
    mouse.mouseup.quadratic = mouse.mouseup.polyline;

    // mouse position to vector
    function broadcast( position )
    {
        let point = position ? [ position[ 0 ], position[ 1 ] ] : [ mouse.x, mouse.y ];
        let vector = convert.toVector( point );

        display( vector );
    }

    // display vector on list, first row
    function display( vector )
    {
        self.initial = list.getRow( 0 ); 

        let step = module.record.grid.precision;
        
        for ( let [ key, value ] of Object.entries( vector ) )
        {
            let input = self.initial.inputs.get( key );
                input.value = convert.toUnit( value );
                input.step = step;
        }
    }

    // set crosshairs on vector when rolling over list
    function highlight( args )
    {
        let pixels = convert.fromVector( convert.toPixels( args.data ) );

        draw.crosshairs.call( crosshairs.ctx, "rgba( 0, 255, 255, 1 )", pixels );
    }

    // draw shapes / path
    function plot()
    {
        use.view = "top";

        if ( !use.map )
            return;
        
        let ctx = use.map.canvas.ctx;
        let points = [];
        let layer = use.map.layer;

        draw.clear.call( ctx );

        if ( !layer.config.visible )
            return;

        //console.warn( "plot", layer.config.shape, use.map.converted, mouse )

        switch ( layer.config.shape )
        {
            case "bezier":
                points = use.map.converted.map( vector => convert.fromVector( vector ) );
                draw.bezier.call( ctx, layer.config.color, points );
                return points;
            
            case "circle":
                let radius = Math.sqrt( Math.pow( ( mouse.start.x - mouse.end.x ), 2 ) + Math.pow( ( mouse.start.y - mouse.end.y ), 2 ) );
                points = [ mouse.start ]; 
                draw.circle.call( ctx, layer.config.color, mouse.start, radius );

                return points;
            
            case "dot":
                points = use.map.converted.map( vector => convert.fromVector( vector ) );
                draw.dots.call( ctx, layer.config.color, points );
                return points;
            
            case "polyline":
                points = use.map.converted.map( vector => convert.fromVector( vector ) );
                draw.path.call( ctx, layer.config.color, points );
                return points;

            case "quadratic":
                points = use.map.converted.map( vector => convert.fromVector( vector ) );
                draw.quadratic.call( ctx, layer.config.color, points );
                return points;

            case "rect":
                let x0 = 0;
                let x1 = 0;
                let y0 = 0;
                let y1 = 0;
                
                if ( mouse.start.x <= mouse.end.x )
                {
                    x0 = mouse.start.x;
                    x1 = mouse.end.x - mouse.start.x;
                }
                else
                {
                    x0 = mouse.end.x;
                    x1 = mouse.start.x - mouse.end.x;
                }
                
                if ( mouse.start.y <= mouse.end.y )
                {
                    y0 = mouse.start.y;
                    y1 = mouse.end.y - mouse.start.y;
                }
                else
                {
                    y0 = mouse.end.y;
                    y1 = mouse.start.y - mouse.end.y;
                }

                points = convert.snapPixels( [ x0, y0, x1, y1 ] );
                
                draw.rect.call( ctx, layer.config.color, points );

                return points;
        }
    }

    // snap vector to grid
    function snap( vector )
    {
        if ( module.record.grid.snap )
            vector = convert.toSnap( vector );

        return vector;
    }

    // save to database, convert to pixels and plot
    async function update()
    {
        await handlers.updateData();
        handlers.convertData();
        plot();
    }

    /****************************************************************/
    // menu
    async function menu()
    {
        let array = module.record.layers || [];
        
        tree = await this.addComponent( { id: module.record.project, type: "tree", format: "block", output: "dual" } );
        tree.subscription.add( { event: "addBranch", handler: listen } );    
        tree.subscription.add( { event: "changeParent", handler: listen } );
        tree.subscription.add( { event: "renameBranch", handler: listen } );
        tree.subscription.add( { event: "selectBranch", handler: listen } );
        tree.update( { array: array } ); 
    }

    // submenu
    async function color()
    {
        picker = await submenu.addComponent( { id: "picker", type: "color", format: "text", output: "hsl" } );
        picker.subscription.add( { event: "update", handler: () =>
        {
            let layer = use.map.layer;
                layer.config.color = picker.value;

            let branch = tree.getBranch( layer );
            let link = branch.detail.link;
                link.style.borderLeftColor = layer.config.color;

            update();
        } } );   
    }

    // content
    async function output()
    {
        await grid.call( this );
        await target.call( this );
    }

    // crosshairs / mouse listeners
    async function target()
    {
        crosshairs = await this.addComponent( { id: "crosshairs", type: "canvas", format: "2d" } );
        crosshairs.element.style.position = "absolute";

        let bbox = this.element.getBoundingClientRect();
        let element = crosshairs.element;
            element.style.pointerEvents = "auto";
            element.addEventListener( "mousemove", ( e ) => 
            {
                mouse.x = e.clientX - bbox.left;
                mouse.y = e.clientY - bbox.top;

                draw.crosshairs.call( crosshairs.ctx, "rgba( 255, 255, 255, 0.5 )", { x: mouse.x, y: mouse.y } );

                ready( e );   
            } );
            element.addEventListener( "mousedown", ready );
            element.addEventListener( "mouseup", ready );

        function ready( e )
        {
            let layer = use.map?.layer;

            if ( !layer )
                return false;

            if ( layer.config.shape )
                mouse[ e.type ][ layer.config.shape ]();
        }
    }

    async function grid()
    {
        this.element.style.padding = 0;
        
        let grid = await this.addComponent( { id: "grid", type: "canvas", format: "2d" } );
            grid.element.style.position = "absolute";
            grid.clear();
            grid.show();

        if ( !module.record.display.grid )
        {
            grid.hide();
            return;
        }

        let x = Math.floor( grid.width / module.record.grid.x );
        let y = Math.floor( grid.height / module.record.grid.y );

        pixels = Math.min( x, y );

        draw.set( { pixels: { x: grid.width, y: grid.height } } );
        
        for ( let x = 0; x < grid.width; x += pixels )
            draw.vertical.call( grid.ctx, "rgba( 255, 255, 255, 0.1 )", { x: x, y: grid.height } );

        for ( let y = 0; y < grid.height; y += pixels )
            draw.horizontal.call( grid.ctx, "rgba( 255, 255, 255, 0.1 )", { x: grid.width, y: y } );  
    }

    // subcontent: shape icons menu
    async function icons()
    {
        subcontent.clear();
        subcontent.element.style.justifyContent = "start";

        let rect =      t2.icons.init( { type: "rect",      height: 16, width: 16, style: "fill: transparent; stroke: gray;" } );
        let circle =    t2.icons.init( { type: "circle",    height: 16, width: 16, style: "fill: transparent; stroke: gray;"} );
        let line =      t2.icons.init( { type: "line",      height: 16, width: 16, style: "stroke: gray;" } );
        let quadratic = t2.icons.init( { type: "quadratic", height: 16, width: 16, style: "fill: transparent; stroke: gray;" } );
        let bezier =    t2.icons.init( { type: "bezier",    height: 16, width: 16, style: "fill: transparent; stroke: gray;" } );
        let polyline =  t2.icons.init( { type: "polyline",  height: 16, width: 16, style: "fill: transparent; stroke: gray;" } );
        let dot =       t2.icons.init( { type: "dot",       height: 16, width: 16, style: "fill: gray;" } );

        let layer = use.map.layer;
        let array = [ polyline, dot, line, rect, circle, quadratic, bezier ];
        let active = array.find( element => element.dataset.type == layer.config.shape ) || array[ 0 ];
        let icons = await subcontent.addComponent( { id: "shapes", type: "icons", format: "flex" } );
            icons.addListener( { type: "click", handler: click } );
            icons.update( array );
            icons.activate( active );

        layer.config.shape = active.dataset.type;

        function click()
        {
            let e      = arguments[ 0 ];
            let event  = arguments[ 1 ];
            let active = arguments[ 2 ];

            layer.config.shape = active.curr.dataset.link;

            update();
        }
    };

    // margin: list
    async function input()
    { 
        let array = use.map.layer.array;
        let step = module.record.grid.precision;

        list = await margin.addComponent( { id: "vectors", type: "list", format: "block" } );
        list.addRowListener( { type: "mouseover", handler: highlight } );
        list.subscription.add( { event: "addRow", handler: update } );
        list.subscription.add( { event: "removeRow", handler: update } );
        list.subscription.add( { event: "saveRow", handler: update } );
        list.subscription.add( { event: "renumber", handler: update } );
        list.addColumn( { 
            input: { name: "x", type: "number", step: step, min: 0, required: "" }, 
            cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
            format: [] } );
        list.addColumn( { 
            input: { name: "y", type: "number", step: step, min: 0, required: "" }, 
            cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
            format: [] } );
        list.addColumn( { 
            input: { name: "z", type: "number", step: step, min: 0, required: "" }, 
            cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
            format: [] } );
        list.populate( { array: array } ); 

        self.initial = list.getRow( 0 );      
    }
};

export default Panel;