const Views = function()
{
    this.init = function()
    {
        let T = t2.icons.init( { type: "text", height: 16, width: 16, text: "T", style: "fill: gray;", parent: submargin } );
        let F = t2.icons.init( { type: "text", height: 16, width: 16, text: "F", style: "fill: gray;", parent: submargin } );
        let B = t2.icons.init( { type: "text", height: 16, width: 16, text: "B", style: "fill: gray;", parent: submargin } );
        let L = t2.icons.init( { type: "text", height: 16, width: 16, text: "L", style: "fill: gray;", parent: submargin } );
        let R = t2.icons.init( { type: "text", height: 16, width: 16, text: "R", style: "fill: gray;", parent: submargin } );
    };
};

export default Views;