const Overlay = function( args )
{
    let self = this;
    let scene = args.scene;
    let draw = scene.modules.get( "draw" );
    let handlers = scene.modules.get( "handlers" );
    let cleared = false;
    let drawing = false;
    let context;
    let overlay;

    this.init = async function()
    {
        this.start = { x: 0, y: 0 };
        this.end = { x: 0, y: 0 };
        this.config = {};

        let parent = t2.ui.elements.get( "middle" );
        let bbox = parent.getBoundingClientRect();

        draw.set( { pixels: { x: bbox.width, y: bbox.height } } );

        overlay = await t2.ui.addComponent( { id: "overlay", component: "canvas", parent: parent } );
        
        this.mouse();
    };

    this.coordinates = () => { return { x: self.x, y: self.y } };

    this.mouse = function()
    {
        if ( !this.type )
            return;

        let parent = overlay.element.parentNode;
        let bbox = parent.getBoundingClientRect();
        let left = bbox.left;
        let top = bbox.top;

        overlay.element.style.cursor = "none";
        overlay.element.addEventListener( "mousemove", ( e ) => 
        {
            self.x = e.clientX - bbox.left;
            self.y = e.clientY - bbox.top;

            draw.crosshairs.call( overlay.ctx, "rgba( 255, 255, 255, 0.5 )", { x: self.x, y: self.y } );

            if ( drawing )
                self.end = { x: self.x, y: self.y };

            if ( !cleared )
            {
                self.config = self.types[ self.type ]( overlay );

                t2.common.output.object( self.config, submenu );
            }
        } );
        overlay.element.addEventListener( "mousedown", () => 
        {
            self.start = { x: self.x, y: self.y };

            if ( context )
                context.close();

            cleared = false;
            drawing = true;                
        } );
        overlay.element.addEventListener( "mouseup", async () => 
        {
            self.end = { x: self.x, y: self.y };

            drawing = false;

            let coord = { x: self.x + left, y: self.y + top };

            context = await t2.ui.addComponent( { id: "actions", component: "context", parent: document.body, coord: coord } );
            context.addLink( { text: "Save",   f: () => handlers.save( context, self ) } );
            context.addLink( { text: "Modify", f: () => handlers.modify( context, self ) } );
            context.addLink( { text: "Clear", f: () => 
            { 
                handlers.clear( context, self );
                self.types[ "clear" ]( overlay );
            } } );
            context.update(); 
        } );
    };

    this.setStyle = ( params ) =>
    {
        console.log( params );
    };

    this.setType = ( type ) => 
    {
        this.type = type;
        this.types[ "clear" ]( overlay );
        this.mouse();
    };

    this.types =
    {
        circle: ( canvas ) =>
        {
            let radius = Math.sqrt( Math.pow( ( self.start.x - self.end.x ), 2 ) + Math.pow( ( self.start.y - self.end.y ), 2 ) );
            
            draw.circle.call( canvas.ctx, "white", self.start, radius );

            return { x: self.start.x, y: self.start.y, radius: radius };
        },

        clear: ( canvas ) =>
        {
            draw.clear.call( canvas.ctx );

            cleared = true;

            if ( context )
                context.close();

            return { x: 0, x0: 0, x1: 0, y: 0, y0: 0, y1: 0, radius: 0 };
        },

        dot: ( canvas ) =>
        {
            let radius = 3;
            
            draw.dot.call( canvas.ctx, "white", self.start, radius );

            return { x: self.start.x, y: self.start.y, radius: radius };
        },
        
        rect: ( canvas ) =>
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
            
            draw.rect.call( canvas.ctx, "white", [ x0, y0, x1, y1 ] );

            return { x0: x0, y0: y0, x1: x1, y1: y1 };
        }
    };
};

export default Overlay;