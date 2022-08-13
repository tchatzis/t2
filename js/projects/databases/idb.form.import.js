const IDBImport = function( module )
{
    this.init = async function()
    {
        let container = await t2.ui.addComponent( { id: "export", title: "Import Data", component: "container", parent: t2.ui.elements.get( "content" ), module: module } );

        let form = t2.common.el( "form", container.element );
            form.id = "import";
            form.addEventListener( "submit", ( e ) => upload( e ) );
        let file = t2.common.el( "input", container.element );
            file.name = "file";
            file.placeholder = "file";
            file.type = "file";
        let submit = t2.common.el( "input", container.element );
            submit.value = "Import";
            submit.type = "submit";
            submit.setAttribute( "Form", form.id ); 
    };

    function upload( e )
    {
        e.preventDefault();

        let data = {};
        let formData = new FormData( e.target );
        let keys = Array.from( formData.keys() );
            keys.forEach( key => data[ key ] = formData.get( key ) );

        console.log( data );
    };
};

export default IDBImport;
