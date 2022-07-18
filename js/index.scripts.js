const scripts =
{
    twoD: async function()
    {
        let scene = this;

        scene.pre = async () =>
        {
            await scene.addElement( { id: "middle", parent: "wrapper" } );
            await scene.addElement( { id: "subcontent", parent: "middle" } );
            await scene.addElement( { id: "margin", parent: "wrapper" } );
        };

        scene.post = async () =>
        {
            await scene.addModule( { default: "default", invoke: "init", path: "../modules/draw", namespace: "draw" } );
            await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/2D", namespace: "twoD" } );
            await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/scripts/overlay", namespace: "overlay", arguments: { scene: scene } } );     
        };

        return scene;   
    },
    
    end: async function()
    {
        let scene = this;

        scene.pre = async () =>
        {

        };

        scene.post = async () =>
        {
            
                
        };

        return scene;   
    },
    
    login: await async function()
    {
        let scene = this;

        scene.pre = async () =>
        {
            await t2.ui.addComponent( { id: "modal", component: "modal", parent: document.body } );
            await scene.addContent( { default: "default", invoke: "init", path: "../forms/forms.login", namespace: "login", parent: "modal" } );
            await scene.addUnload( { namespace: "login", execute: "success" } );
            await scene.addUnload( { namespace: "this", execute: "removeComponents", arguments: [ "modal" ] } );  
        };

        scene.post = async () =>
        {
            
                
        };

        return scene;
    },

    svg: async function()
    {
        let scene = this;

        scene.pre = async () =>
        {
            await scene.addElement( { id: "middle", parent: "wrapper" } );
            await scene.addElement( { id: "subcontent", parent: "middle" } );
            await scene.addElement( { id: "margin", parent: "wrapper" } );
            await scene.addElement( { id: "submargin", parent: "margin" } );
        };

        scene.post = async () =>
        {
            await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/scripts/icons.shapes", namespace: "svg" } );
            await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/scripts/icons.views", namespace: "svg" } );

            let svg = await scene.addModule( { default: "default", invoke: "init", path: "../modules/svg/svg", namespace: "svg" } );
            /*let layer = await svg.addType( { name: "layer1", parent: t2.ui.elements.get( "middle" ), type: "layer" } );
            let rect  = await svg.addType( { name: "rect", parent: layer.element, type: "rect" } );
                rect.addAttribute( "width", 28 );
                rect.addAttribute( "height", 28 );
                rect.addAttribute( "x", 0 );
                rect.addAttribute( "y", 0 );
                rect.addStyle( { name: "fill", value: "gray" } );
                rect.addStyle( { name: "stroke", value: "orange" } );
                rect.setStyle();*/

            let template = ( params ) => 
            {
                let name = t2.common.el( "div", params.parent );
                    name.innerText = params.item.name;
                    name.classList.add( "data" );

                let type = t2.common.el( "div", params.parent );
                    type.innerText = params.item.type;
                    type.classList.add( "data" );
                
                let attributes = params.item.attributes || [];
                    attributes.forEach( attr => 
                    {
                        switch ( attr )
                        {
                            case "points":
                                let points = t2.common.el( "input", params.parent );
                                    points.type = "text";
                                    points.name = attr;
                                    points.size = 30;
                                    points.placeholder = params.item.hint;
                                    points.value = params.item.values[ attr ];
                                    points.dataset.value = params.item.values[ attr ];
                                break;
                        
                            default:
                                let input = t2.common.el( "input", params.parent );
                                    input.type = "number";
                                    input.name = attr;
                                    input.size = 2;
                                    input.min = 0;
                                    input.placeholder = attr;
                                    input.value = params.item.values[ attr ];
                                    input.dataset.value = params.item.values[ attr ];
                                    input.addEventListener( "input", () =>
                                    {
                                        let value = input.value;

                                        if ( value )
                                        {
                                            params.item.element.setAttribute( attr, value );
                                            params.item.values[ attr ] = Number( value );
                                        }
                                    } );
                                break;
                            }
                        } );
                
                return params.parent;
            };


            /*let circle = await svg.addType( { name: "circle", parent: layer.element, type: "circle" } );
                circle.addAttribute( "r", 14 );
                circle.addAttribute( "cx", 14 );
                circle.addAttribute( "cy", 50 );
                circle.addStyle( { name: "stroke-width", value: 3 } );
                circle.setStyle();*/


            // attributes to popup list
            let popup = await t2.ui.addComponent( { id: "popup", component: "popup", parent: t2.ui.elements.get( "margin" ), module: svg } );

            let list = await t2.ui.addComponent( { id: "tree", component: "list", parent: popup.element, module: svg } );
                list.invoke( template );
                list.populate( { array: Array.from( svg.elements.values() ) } );
        };

        return scene;       
    },

    trades: async function()
    {
        let scene = this;

        scene.pre = async () => 
        { 
            await scene.addElement( { id: "menu", parent: "wrapper" } );
            await scene.addElement( { id: "submenu", parent: "menu", ignore: "clear" } );
            await scene.addElement( { id: "middle", parent: "wrapper" } );
            await scene.addElement( { id: "content", parent: "middle" } );
            await scene.addElement( { id: "subcontent", parent: "middle", ignore: "clear" } );
            await scene.addElement( { id: "margin", parent: "wrapper" } );
            await scene.addElement( { id: "submargin", parent: "margin", ignore: "clear" } );
            await scene.addUnload( { namespace: "this", execute: "reset", arguments: [] } );     
        };

        scene.post = async () =>
        {
            // menu links
            let module = await scene.addModule( { default: "default", invoke: "init", path: "../projects/trades/trades", namespace: "trades" } );
            let symbols = Array.from( module.symbols.keys() );
            let menu = await t2.ui.addComponent( { id: "symbols", component: "menu", parent: t2.ui.elements.get( "menu" ), array: symbols, horizontal: false } );
                menu.addListener( { type: "click", handler: function() { module.handlers.clicked( ...arguments ) } } );  
        };

        return scene;
    },


};

export default scripts;