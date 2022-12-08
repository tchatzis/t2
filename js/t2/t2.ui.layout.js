import Container from "./t2.ui.container.element.js";

const Layout = function()
{
    const layout = {};
    const container = new Container();
    
    this.init = async function( params )
    {
        this.reset( params );

        await layout[ params.name ].call( this, params );
    };

    this.reset = function( params )
    {
        for ( let [ id, component ] of t2.ui.children )
        {
            let dataset = component.element.dataset.ignore?.split( "," ) || [];
            let ignore = params.ignore?.some( event => dataset.find( data => data == event ) );

            if ( !ignore )
                component.element.remove();
        }
    };

    layout.all = async function()
    {
        await container.addElement( { id: "header", parent: document.body } );
        await container.addElement( { id: "wrapper", parent: document.body } );
        await container.addElement( { id: "footer", parent: document.body } );
        await container.addElement( { id: "message", parent: document.body } );
        
        await container.addElement( { id: "menu", parent: t2.ui.children.get( "wrapper" ).element } );
        await container.addElement( { id: "submenu", parent: t2.ui.children.get( "menu" ).element } );
        await container.addElement( { id: "middle", parent: t2.ui.children.get( "wrapper" ).element } );
        await container.addElement( { id: "content", parent: t2.ui.children.get( "middle" ).element } );
        await container.addElement( { id: "subcontent", parent: t2.ui.children.get( "middle" ).element } );
        await container.addElement( { id: "margin", parent: t2.ui.children.get( "wrapper" ).element } );
        await container.addElement( { id: "submargin", parent: t2.ui.children.get( "margin" ).element } );  
    };

    layout.minimal = async function()
    {
        await container.addElement( { id: "header", parent: document.body } );
        await container.addElement( { id: "wrapper", parent: document.body } );
        await container.addElement( { id: "footer", parent: document.body } );
    };

    layout.navigation = async function()
    {
        await container.addElement( { id: "header", parent: document.body } );
        await container.addElement( { id: "footer", parent: document.body } );
    };
    
    layout.modal = async function()
    {
        await container.addElement( { id: "modal", parent: document.body } );
    };
};

export default Layout;