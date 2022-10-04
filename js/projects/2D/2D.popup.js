const Attributes = function()
{
    let args = arguments[ 0 ];
    
    let add = () => console.log( "add" );

    let remove = () => console.log( "remove" );
    
    let snap = () => console.log( "snap" );
    
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
    
    this.init = async function()
    {
        // attributes to popup list
        let popup = await t2.ui.addComponent( { title: "Attributes", component: "popup", parent: middle } );
            popup.addLink( { text: "Add", f: add } );
            popup.addLink( { text: "Remove", f: remove } );
            popup.addLink( { text: "Snap", f: snap } );
            popup.update();

        let list = await t2.ui.addComponent( { id: "tree", component: "list", parent: popup.element, module: args.svg } );
            list.invoke( template );
            list.populate( { array: Array.from( args.svg.elements.values() ) } );
    };
};

export default Attributes;