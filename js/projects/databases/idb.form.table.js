const IDBTable = function( module )
{
    this.init = async function()
    {
        let container = await t2.ui.addComponent( { id: "dump", title: "Add Table", component: "container", parent: t2.ui.elements.get( "content" ), module: module } );

        let form = t2.common.el( "form", container.element );
            form.id = "table";
            form.addEventListener( "submit", async ( e ) =>
            {
                e.preventDefault();

                let data = {};
                let formData = new FormData( e.target );
                let keys = Array.from( formData.keys() );
                    keys.forEach( key => data[ key ] = formData.get( key ) );

                await t2.db.table.add( data );

                //console.log( t2.db.table.add )

                version.value = ( t2.db.version || 1 ) + 1;
                table.value = null;
            } );
        let name = t2.common.el( "input", container.element );
            name.name = "name";
            name.placeholder = "name";
            name.value = t2.db.name;
            name.type = "text";
            name.setAttribute( "Form", form.id );
        let version = t2.common.el( "input", container.element );
            version.name = "version";
            version.type = "number";
            version.value = t2.db.version + 1;
            version.placeholder = "version";
            version.setAttribute( "Form", form.id );
        let table = t2.common.el( "input", container.element );
            table.name = "table";
            table.placeholder = "table";
            table.setAttribute( "Form", form.id );
            table.setAttribute( "required", "" );
        let submit = t2.common.el( "input", container.element );
            submit.value = "Add";
            submit.type = "submit";
            submit.setAttribute( "Form", form.id ); 
    };
};

export default IDBTable;