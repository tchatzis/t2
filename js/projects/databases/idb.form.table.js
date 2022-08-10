const IDBTable = function()
{
    let args = arguments[ 0 ];
    
    this.init = function()
    {
        let content = t2.ui.elements.get( "content" );
     
        let div = t2.common.el( "div", content );
            div.classList.add( "hform" );
        let title = t2.common.el( "div", div );
            title.classList.add( "title" );
            title.textContent = "Add Table"; 
        let form = t2.common.el( "form", div );
            form.id = "table";
            form.addEventListener( "submit", async ( e ) =>
            {
                e.preventDefault();

                let data = {};
                let formData = new FormData( e.target );
                let keys = Array.from( formData.keys() );
                    keys.forEach( key => data[ key ] = formData.get( key ) );

                await t2.db.table.add( data );

                version.value = ( t2.db.version || 1 ) + 1;
                table.value = null;
            } );
        let name = t2.common.el( "input", div );
            name.name = "name";
            name.placeholder = "name";
            name.value = t2.db.name;
            name.type = "text";
            name.setAttribute( "Form", form.id );
        let version = t2.common.el( "input", div );
            version.name = "version";
            version.type = "number";
            version.value = t2.db.version + 1;
            version.placeholder = "version";
            version.setAttribute( "Form", form.id );
        let table = t2.common.el( "input", div );
            table.name = "table";
            table.placeholder = "table";
            table.setAttribute( "Form", form.id );
            table.setAttribute( "required", "" );
        let submit = t2.common.el( "input", div );
            submit.value = "Add";
            submit.type = "submit";
            submit.setAttribute( "Form", form.id ); 
    };
};

export default IDBTable;