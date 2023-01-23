import Common from "../../t2/t2.container.handlers.js";
import Draw from "../../modules/draw.js";

const Panel = function( module )
{
    let self = this;
    let use = {};
    let axes = [ "x", "y", "z" ];
    let panel;
    let draw = new Draw();
    let cleared = false;
    let drawing = false;
    let pixels;
    let list;
    let tree;
    let crosshairs;
    let picker;
    let submenu = t2.ui.children.get( "submenu" );
    let margin = t2.ui.children.get( "margin" );
    let subcontent = t2.ui.children.get( "subcontent" );
    let layer;
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
        toUnit: ( value ) => value / pixels
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

            let existing = module.record.layers.find( item => ( item.parent == detail.label && item.label == detail.branch.label ) );
            let d = { ...detail.branch.detail };
            let uuid = d.uuid;
            let canvas = await this.addComponent( { id: d.label, type: "canvas", format: "2d" } );
                canvas.element.style.position = "absolute";

            if ( existing )
            {
                layer = new Layer( existing ); 
            }
            else
            {
                layer = new Layer( { array: [], label: detail.branch.label, parent: detail.label, config: { visible: true } } );

                module.record.layers.push( layer );
                
                await t2.db.tx.update( module.q.table, Number( module.record.id ), module.record );
            }

            map.set( uuid, { canvas: canvas, detail: d, layer: layer } );  
        },
        selectBranch: async ( detail ) => 
        {
            margin.clear();
            subcontent.clear();

            use.map = map.get( detail.uuid );
            console.log( detail.label, use );

            if ( !detail.root && use.map.layer )
            {   
                submenu.show();
                picker.update( use.map.layer.config.color );
                await icons();
                await input();  
            }
            else
                submenu.hide();
        },
        // data
        convertData: () => use.map.converted = use.map.layer.array.map( vector => convert.toPixels( vector ) ),
        updateData: async () => await t2.db.tx.update( module.q.table, Number( module.record.id ), module.record ),
    };

    // mouse event handlers
    const mouse = 
    {
        mousedown:
        {
            dot:      () => self.initial.inputs.get( "add" ).click(),
            polyline: () => self.initial.inputs.get( "add" ).click()
        },
        
        mousemove:
        {
            dot:      broadcast,
            polyline: broadcast
        }
    };

    const shapes =
    {
        circle: ( ctx ) =>
        {
            let radius = Math.sqrt( Math.pow( ( self.start.x - self.end.x ), 2 ) + Math.pow( ( self.start.y - self.end.y ), 2 ) );
            
            draw.circle.call( ctx, "white", self.start, radius );

            return { x: self.start.x, y: self.start.y, radius: radius };
        },

        clear: ( ctx ) =>
        {
            draw.clear.call( ctx );

            cleared = true;

            ctx.close();

            return { x: 0, x0: 0, x1: 0, y: 0, y0: 0, y1: 0, radius: 0 };
        },

        dot: ( ctx ) =>
        {
            let radius = 3;
            
            draw.dot.call( ctx, "white", self.start, radius );

            return { x: self.start.x, y: self.start.y, radius: radius };
        },
        
        rect: ( ctx ) =>
        {
            let x0 = 0;
            let x1 = 0;
            let y0 = 0;
            let y1 = 0;
            
            if ( self.start.x <= self.end.x )
            {
                x0 = self.start.x;
                x1 = self.end.x - self.start.x;
            }
            else
            {
                x0 = self.end.x;
                x1 = self.start.x - self.end.x;
            }
            
            if ( self.start.y <= self.end.y )
            {
                y0 = self.start.y;
                y1 = self.end.y - self.start.y;
            }
            else
            {
                y0 = self.end.y;
                y1 = self.start.y - self.end.y;
            }
            
            draw.rect.call( ctx, "white", [ x0, y0, x1, y1 ] );

            return { x0: x0, y0: y0, x1: x1, y1: y1 };
        }
    };

    // mouse position updates list, first row
    function broadcast()
    {
        if ( !self.initial )
            return;

        let point = [ mouse.x, mouse.y ];
        let vector = unview( point );

        for ( let [ key, value ] of Object.entries( vector ) )
        {
            let input = self.initial.inputs.get( key );
                input.value = value;
        }

        use.vector = vector;

        return vector;
    }

    // set crosshairs on vector when rolling over list
    function highlight( args )
    {
        let pixels = view( convert.toPixels( args.data ) );

        draw.crosshairs.call( crosshairs.ctx, "rgba( 0, 255, 255, 1 )", pixels );
    }

    // draw shapes / path
    function plot()
    {
        use.view = "top";
        
        let ctx = use.map.canvas.ctx;
        let points = use.map.converted.map( vector => view( vector ) );
        let layer = use.map.layer;

        draw.clear.call( ctx );

        if ( !layer.config.visible )
            return;

        switch ( layer.config.shape )
        {
            case "dot":
                draw.dots.call( ctx, layer.config.color, points );
            break;
            
            case "polyline":
                draw.path.call( ctx, layer.config.color, points );
            break;
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

    // point to vector
    function unview( point )
    {
        switch ( use.view )
        {
            case "top":
                return snap( { x: point[ 0 ], y: 0, z: point[ 1 ] } );
        }
    }

    // vector to point
    function view( vector )
    {
        switch ( use.view )
        {
            case "top":
                return { x: vector.x, y: vector.z };
        }
    }

    /****************************************************************/
    // menu
    async function menu()
    {
        let array = module.record.layers || [];
        
        tree = await this.addComponent( { id: module.record.project, type: "tree", format: "block", output: "dual" } );
        tree.subscription.add( { event: "addBranch", handler: listen } );    
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

                if ( layer.config.shape )
                    mouse[ e.type ][ layer.config.shape ]();
            } );
            element.addEventListener( "mousedown", ( e ) => 
            {
                if ( layer.config.shape )
                    mouse[ e.type ][ layer.config.shape ]();
            } )
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

        let a = t2.icons.init( { type: "rect", height: 16, width: 16, style: "fill: gray;" } );
        let b = t2.icons.init( { type: "rect", height: 16, width: 16, style: "stroke: gray;" } );
        let c = t2.icons.init( { type: "circle", height: 16, width: 16, r: 8, style: "fill: gray;" } );
        let d = t2.icons.init( { type: "circle", height: 16, width: 16, r: 8, style: "stroke: gray;"} );
        let e = t2.icons.init( { type: "polygon", height: 16, width: 16, points: "8,0 16,16 0,16", style: "fill: gray;" } );
        let f = t2.icons.init( { type: "polygon", height: 16, width: 16, points: "8,0 16,16 0,16", style: "stroke: gray;" } );
        let g = t2.icons.init( { type: "line", height: 16, width: 16, x1: 0, y1: 12, x2: 16, y2: 4, style: "stroke: gray;" } );
        
        
        let h = t2.icons.init( { type: "polyline", height: 16, width: 16, points: "0,0 16,4 4,8 8,12 6,16", style: "fill: none; stroke: gray;" } );
        let i = t2.icons.init( { type: "dot", height: 16, width: 16, r: 3, style: `fill: gray;` } );

        let array = [ h, i ];//[ a, b, c, d, e, f, g ];
        let active = array.find( element => element.dataset.type == layer.config.shape ) || array[ 0 ];
        let icons = await subcontent.addComponent( { id: "shapes", type: "icons", format: "flex" } );
            icons.addListener( { type: "click", handler: click } );
            icons.update( array );
            icons.activate( active );

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