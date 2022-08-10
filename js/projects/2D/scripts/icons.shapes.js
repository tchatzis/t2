const Shapes = function()
{
    this.init = async function()
    {
        let subcontent = t2.ui.elements.get( "subcontent" );
            subcontent.style.justifyContent = "start";

        let submenu = t2.ui.elements.get( "submenu" );

        let a = t2.icons.init( { type: "rect", height: 16, width: 16, style: "fill: gray;" } );
        let b = t2.icons.init( { type: "rect", height: 16, width: 16, style: "stroke: gray;" } );
        let c = t2.icons.init( { type: "circle", height: 16, width: 16, r: 8, style: "fill: gray;" } );
        let d = t2.icons.init( { type: "circle", height: 16, width: 16, r: 8, style: "stroke: gray;"} );
        let e = t2.icons.init( { type: "polygon", height: 16, width: 16, points: "8,0 16,16 0,16", style: "fill: gray;" } );
        let f = t2.icons.init( { type: "polygon", height: 16, width: 16, points: "8,0 16,16 0,16", style: "stroke: gray;" } );
        let g = t2.icons.init( { type: "line", height: 16, width: 16, x1: 0, y1: 12, x2: 16, y2: 4, style: "stroke: gray;" } );
        let h = t2.icons.init( { type: "polyline", height: 16, width: 16, points: "0,0 16,4 4,8 8,12 6,16", style: "fill: none; stroke: gray;" } );
        let i = t2.icons.init( { type: "dot", height: 16, width: 16, r: 3, style: "fill: yellow;" } );

        let array = [ a, b, c, d, e, f, g, h, i ];

        let icons = await t2.ui.addComponent( { id: "shapes", component: "icons", parent: subcontent, array: array, horizontal: true } );
            icons.addListener( { type: "click", handler: function() 
            { 
                let e      = arguments[ 0 ];
                let event  = arguments[ 1 ];
                let active = arguments[ 2 ];
                let style  = active.curr.dataset.style;
                let type   = active.curr.dataset.type;

                submenu.textContent = type;
                console.log( style, type ); 
            } } ); 
    };
};

export default Shapes;