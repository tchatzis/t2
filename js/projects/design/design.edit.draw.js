import Common from "../../t2/t2.container.handlers.js";
import Draw from "../../modules/draw.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let draw = new Draw();
    let cleared = false;
    let drawing = false;
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
            { id: "submenu", functions: [ { ignore: "clear" }, { clear: null } ] }, 
            { id: "subcontent", functions: [ { ignore: "clear" }, { clear: null } ] },
            { id: "submargin", functions: [ { ignore: "clear" }, { clear: null } ] },
            { id: "menu", functions: [ { ignore: "clear" }, { clear: null }, { invoke: [ { f: tree, args: null } ] } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    } 

    // common
    function listen( e )
    {
        handlers[ e.type ]( e.detail );
    }

    const Layer = function( params )
    {
        Object.assign( this, params );
    };

    const handlers =
    {
        // branch
        addBranch: async ( detail ) => 
        {
            module.record.layers = module.record.layers || [];

            let layer;
            let canvas = await this.addComponent( { id: detail.branch.label, type: "canvas", format: "2d" } );
            let existing = module.record.layers.find( item => ( item.parent == detail.label && item.label == detail.branch.label ) );

            if ( existing )
            {
                layer = new Layer( existing );
            }
            else
            {
                layer = new Layer( { array: [], label: detail.branch.label, parent: detail.label, visible: true } );

                module.record.layers.push( layer );
                
                await t2.db.tx.update( module.q.table, Number( module.record.id ), module.record );
            }

            map.set( detail.branch.detail, { canvas: canvas, detail: detail.branch.detail, layer: layer } );

            //detail.branch.selectBranch( detail.branch.detail.link );
        },
        selectBranch: async ( detail ) => 
        {
            margin.clear();
            subcontent.clear();

            let m = map.get( detail );

            if ( !detail.root && m?.layer )
            {
                self.layer = m.layer;
                
                await icons();
                await input();
            }
        },
        // data
        plotData: () => 
        {
            //self.layer.array.forEach( vector => console.log( vector ) );
            
            console.log( self.layer.array );
        },
        updateData: async () => await t2.db.tx.update( module.q.table, Number( module.record.id ), module.record )
    };

    const types =
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

    // menu
    async function tree()
    {
        let array = module.record.layers || [];
        
        let tree = await this.addComponent( { id: module.record.project, type: "tree", format: "block" } );
            tree.subscription.add( { event: "addBranch", handler: listen } );    
            tree.subscription.add( { event: "selectBranch", handler: listen } );
            tree.update( { array: array } ); 
    }

    // content
    async function output()
    {
        await grid.call( this );
        await crosshairs.call( this );
    }

    async function crosshairs()
    {
        let crosshairs = await this.addComponent( { id: "crosshairs", type: "canvas", format: "2d" } );
        let bbox = this.element.getBoundingClientRect();
        let element = crosshairs.element;
            element.style.pointerEvents = "auto";
            element.addEventListener( "mousemove", ( e ) => 
            {
                self.x = e.clientX - bbox.left;
                self.y = e.clientY - bbox.top;

                draw.crosshairs.call( crosshairs.ctx, "rgba( 255, 255, 255, 0.5 )", { x: self.x, y: self.y } );

                /*if ( drawing )
                    self.end = { x: self.x, y: self.y };

                if ( !cleared && self.shape )
                {   
                    self.config = types[ self.shape ]( crosshairs.ctx );

                    //console.log( self.config );

                    //t2.common.output.object( self.config, submenu );
                }*/
            } );
    }

    async function grid()
    {
        this.element.style.padding = 0;
        
        let grid = await this.addComponent( { id: "grid", type: "canvas", format: "2d" } );
            grid.clear();
            grid.show();

        if ( !module.record.display.grid )
        {
            grid.hide();
            return;
        }

        let x = Math.floor( grid.width / module.record.grid.x );
        let y = Math.floor( grid.height / module.record.grid.y );
        let pixels = Math.min( x, y );

        draw.set( { pixels: { x: grid.width, y: grid.height } } );
        
        for ( let x = 0; x < grid.width; x += pixels )
            draw.vertical.call( grid.ctx, "rgba( 255, 255, 255, 0.1 )", { x: x, y: grid.height } );

        for ( let y = 0; y < grid.height; y += pixels )
            draw.horizontal.call( grid.ctx, "rgba( 255, 255, 255, 0.1 )", { x: grid.width, y: y } );  
    }

    // subcontent
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
        let i = t2.icons.init( { type: "dot", height: 16, width: 16, r: 3, style: "fill: yellow;" } );

        let array = [ i, a, b, c, d, e, f, g, h ];

        let icons = await subcontent.addComponent( { id: "shapes", type: "icons", format: "flex" } );
            icons.addListener( { type: "click", handler: click } );
            icons.update( array );
            icons.activate( array[ 0 ] );

        function click()
        {
            let e      = arguments[ 0 ];
            let event  = arguments[ 1 ];
            let active = arguments[ 2 ];

            self.shape = active.curr.dataset.link;
        }
    };

    // margin
    async function input()
    { 
        let array = self.layer.array;

        let list = await margin.addComponent( { id: "vectors", type: "list", format: "block" } );
            //list.addRowListener( { type: "contextmenu", handler: highlight } );
            list.subscription.add( { event: "addRow", handler: () => 
            {
                handlers.updateData();
                handlers.plotData();
            } } );
            //list.subscription.add( { event: "removeRow", handler: () => update( array ) } );
            //list.subscription.add( { event: "saveRow", handler: () => update( array ) } );
            //list.subscription.add( { event: "renumber", handler: () => update( array ) } );
            list.addColumn( { 
                input: { name: "x", type: "number", step: 0.01, min: 0, required: "" }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [] } );
            list.addColumn( { 
                input: { name: "y", type: "number", step: 0.01, min: 0, required: "" }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [] } );
            list.addColumn( { 
                input: { name: "z", type: "number", step: 0.01, min: 0, required: "" }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [] } );
            list.populate( { array: array } ); 
    }
};

export default Panel;