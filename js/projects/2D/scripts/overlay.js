const Overlay = function( args )
{
    let self = this;
    let scene = args.scene;
    let draw = scene.modules.get( "draw" );
    let drawing = false;

    this.start = { x: 0, y: 0 };
    this.end = { x: 0, y: 0 };
    this.type = "circle";
    
    this.init = async function()
    {
        let parent = t2.ui.elements.get( "middle" );
        let bbox = parent.getBoundingClientRect();
        let config = {};

        draw.set( { pixels: { x: bbox.width, y: bbox.height } } );

        let overlay = await t2.ui.addComponent( { id: "overlay", component: "canvas", parent: parent } );
            overlay.element.style.cursor = "none";
            overlay.element.addEventListener( "mousemove", ( e ) => 
            {
                self.x = e.clientX - bbox.left;
                self.y = e.clientY - bbox.top;

                if ( drawing )
                    self.end = { x: self.x, y: self.y };

                draw.crosshairs.call( overlay.ctx, "rgba( 255, 255, 255, 0.75 )", { x: self.x, y: self.y } );

                config = self.types[ self.type ]( overlay );
            } );
            overlay.element.addEventListener( "mousedown", () => 
            {
                self.start = { x: self.x, y: self.y };
                self.end = {};

                drawing = true;                
            } );
            overlay.element.addEventListener( "mouseup", () => 
            {
                self.end = { x: self.x, y: self.y };

                drawing = false;
            } );
    };

    this.coordinates = () => { return { x: self.x, y: self.y } };

    this.types =
    {
        circle: ( overlay ) =>
        {
            let radius = Math.sqrt( Math.pow( ( self.start.x - self.end.x ), 2 ) + Math.pow( ( self.start.y - self.end.y ), 2 ) );
            
            draw.circle.call( overlay.ctx, "white", self.start, radius );

            return { x: self.start.x, y: self.start.y, radius: radius };
        },

        dot: ( overlay ) =>
        {
            let radius = 3;
            
            draw.dot.call( overlay.ctx, "white", self.start, radius );

            return { x: self.start.x, y: self.start.y, radius: radius };
        },
        
        rect: ( overlay ) =>
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
            
            draw.rect.call( overlay.ctx, "white", [ x0, y0, x1, y1 ] );

            return { x0: x0, y0: y0, x1: x1, y1: y1 };
        }
    };
};

export default Overlay;