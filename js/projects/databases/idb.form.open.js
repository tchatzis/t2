const IDBOpen = function( module )
{
    let listeners = [];

    this.addListener = function( listener )
    {
        listeners.push( listener );
    };
    
    this.init = async function()
    {
        let container = await t2.ui.addComponent( { id: "export", title: "DB Status", component: "container", parent: t2.ui.elements.get( "content" ), module: module } );

        let form = t2.common.el( "form", container.element );
            form.id = "open";
            form.addEventListener( "submit", openDB );
        let name = t2.common.el( "input", container.element );
            name.name = "name";
            name.placeholder = "db name";
            name.value = t2.db.name;
            name.setAttribute( "Form", form.id );
        let version = t2.common.el( "input", container.element );
            version.name = "version";
            version.type = "number";
            version.value = t2.db.version;
            version.placeholder = "version name";
            version.setAttribute( "Form", form.id );
        let submit = t2.common.el( "input", container.element );
            submit.value = "Open";
            submit.type = "submit";
            submit.setAttribute( "Form", form.id ); 
        let close = t2.common.el( "input", container.element );
            close.value = "Close";
            close.type = "submit";
            close.addEventListener( "click", closeDB );
    };

    async function closeDB( e )
    {
        e.preventDefault();

        await t2.db.db.close();

        t2.db.version = 0;

        submenu.textContent = "CLOSED";
    }

    async function openDB( e )
    {
        e.preventDefault();

        let data = {};
        let formData = new FormData( e.target );
        let keys = Array.from( formData.keys() );
            keys.forEach( key => data[ key ] = formData.get( key ) );

        await t2.db.open( data );

        listeners.forEach( listener => listener.handler( data ) );

        submenu.textContent = `${ t2.db.name } v${ t2.db.version }`;
    }
};

export default IDBOpen;