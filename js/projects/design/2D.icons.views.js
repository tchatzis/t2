const Views = function()
{
    this.init = async function()
    {
        let submargin = t2.ui.elements.get( "submargin" );
            submargin.style.justifyContent = "start";
        
        let T = t2.icons.init( { type: "text", height: 16, width: 16, text: "T", style: "fill: gray;", parent: submargin } );
        let F = t2.icons.init( { type: "text", height: 16, width: 16, text: "F", style: "fill: gray;", parent: submargin } );
        let B = t2.icons.init( { type: "text", height: 16, width: 16, text: "B", style: "fill: gray;", parent: submargin } );
        let L = t2.icons.init( { type: "text", height: 16, width: 16, text: "L", style: "fill: gray;", parent: submargin } );
        let R = t2.icons.init( { type: "text", height: 16, width: 16, text: "R", style: "fill: gray;", parent: submargin } );

        let array = [ T, F, B, L, R ];

        let icons = await t2.ui.addComponent( { id: "views", component: "icons", parent: submargin, array: array, horizontal: true } );
            icons.addListener( { type: "click", handler: function() 
            { 
                let e      = arguments[ 0 ];
                let event  = arguments[ 1 ];
                let active = arguments[ 2 ];
                //let style  = active.curr.dataset.style;
                //let type   = active.curr.dataset.type;

                //submenu.textContent = type;
                //overlay.setType( type );
                //console.log( style, type ); 
            } } ); 
    };
};

export default Views;