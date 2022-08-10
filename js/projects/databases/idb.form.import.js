const IDBImport = function( module )
{
    let self = this;

    this.init = function()
    {
        let content = t2.ui.elements.get( "content" );
     
        let div = t2.common.el( "div", content );
            div.classList.add( "hform" );
        let title = t2.common.el( "div", div );
            title.classList.add( "title" );
            title.textContent = "File"; 
        let form = t2.common.el( "form", div );
            form.id = "import";
            form.addEventListener( "submit", ( e ) => upload( e ) );
        let file = t2.common.el( "input", div );
            file.name = "file";
            file.placeholder = "file";
            file.type = "file";
        let submit = t2.common.el( "input", div );
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
