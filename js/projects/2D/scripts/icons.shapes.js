const Shapes = function()
{
    this.init = function()
    {
        subcontent.style.justifyContent = "start";

        let a = t2.icons.init( { type: "rect", height: 16, width: 16, style: "fill: gray;", parent: subcontent } );
        let b = t2.icons.init( { type: "rect", height: 16, width: 16, style: "stroke: gray;", parent: subcontent } );
        let c = t2.icons.init( { type: "circle", height: 16, width: 16, r: 8, style: "fill: gray;", parent: subcontent } );
        let d = t2.icons.init( { type: "circle", height: 16, width: 16, r: 8, style: "stroke: gray;", parent: subcontent } );
        let e = t2.icons.init( { type: "polygon", height: 16, width: 16, points: "8,0 16,16 0,16", style: "fill: gray;", parent: subcontent } );
        let f = t2.icons.init( { type: "polygon", height: 16, width: 16, points: "8,0 16,16 0,16", style: "stroke: gray;", parent: subcontent } );
        let g = t2.icons.init( { type: "line", height: 16, width: 16, x1: 0, y1: 12, x2: 16, y2: 4, style: "stroke: gray;", parent: subcontent } );
        let h = t2.icons.init( { type: "polyline", height: 16, width: 16, points: "0,0 16,4 4,8 8,12 6,16", style: "fill: none; stroke: gray;", parent: subcontent } );
        let i = t2.icons.init( { type: "dot", height: 16, width: 16, r: 3, style: "fill: yellow;", parent: subcontent } );
    };
};

export default Shapes;