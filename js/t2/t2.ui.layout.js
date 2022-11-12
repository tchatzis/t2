const Layout = function()
{
    this.init = async function( params )
    {
        this.reset( params );

        await layout[ params.layout ].call( this, params );
    };

    this.reset = function( params )
    {
        for ( let [ id, component ] of t2.ui.children )
        {
            if ( !params.ignore.find( ignore => id.match( new RegExp( ignore, "g" ) ) ) )
            {
                component.element.remove();
                t2.ui.children.delete( id );
            }
        }
    };

    const layout = {};

    layout.all = async function( params )
    {
        await t2.ui.addElement( { id: "header", parent: document.body } );
        await t2.ui.addElement( { id: "wrapper", parent: document.body } );
        await t2.ui.addElement( { id: "footer", parent: document.body } );
        
        await t2.ui.addElement( { id: "menu", parent: t2.ui.children.get( "wrapper" ).element } );
        await t2.ui.addElement( { id: "submenu", parent: t2.ui.children.get( "menu" ).element } );
        await t2.ui.addElement( { id: "middle", parent: t2.ui.children.get( "wrapper" ).element } );
        await t2.ui.addElement( { id: "content", parent: t2.ui.children.get( "middle" ).element } );
        await t2.ui.addElement( { id: "subcontent", parent: t2.ui.children.get( "middle" ).element } );
        await t2.ui.addElement( { id: "margin", parent: t2.ui.children.get( "wrapper" ).element } );
        await t2.ui.addElement( { id: "submargin", parent: t2.ui.children.get( "margin" ).element } );
    };

    layout.minimal = async function( params )
    {
        await t2.ui.addElement( { id: "header", parent: document.body } );
        await t2.ui.addElement( { id: "wrapper", parent: document.body } );
        await t2.ui.addElement( { id: "footer", parent: document.body } );
    };
    
    layout.modal = async function( params )
    {
        await t2.ui.addElement( { id: "modal", parent: document.body } );
    };
};

export default Layout;