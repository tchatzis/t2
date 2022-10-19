const Scripts = function( module )
{
    this.init = async () => 
    {
        return {
            [ "2D" ]: async function()
            {
                let scene = this;

                scene.pre = async () =>
                {
                    await scene.addElement( { id: "menu", parent: t2.ui.getElement( "wrapper" ).element } );
                    await scene.addElement( { id: "submenu", parent: t2.ui.getElement( "menu" ).element } );
                    await scene.addElement( { id: "middle", parent: t2.ui.getElement( "wrapper" ).element } );
                    await scene.addElement( { id: "subcontent", parent: t2.ui.getElement( "middle" ).element } );
                    await scene.addElement( { id: "margin", parent: t2.ui.getElement( "wrapper" ).element } );
                    await scene.addElement( { id: "submargin", parent: t2.ui.getElement( "margin" ).element } );
                };

                scene.post = async () =>
                {
                    let main = await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/2D", namespace: "2D", arguments: { scene: scene } } );
                    
                    /*let loaded = false;
                    let tree = await t2.ui.addComponent( { id: "layers", component: "tree", parent: t2.ui.elements.get( "menu" ), breadcrumb: 1 } );
                        tree.addListener( { type: "click", handler: click } ); 
                    let root = tree.addBranch( { label: "root", parent: null } );
                    let child1 = tree.addBranch( { label: "child 1", parent: root } );
                    let child2 = tree.addBranch( { label: "child 2", parent: root } );
                    let child3 = tree.addBranch( { label: "child 3", parent: child2 } );

                    tree.populate();

                    function click( link, branch )
                    {
                        load(); 
                    }*/
                    
                    async function load()
                    {
                        if ( loaded )
                            return;

                        
                        
                        //await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/2D.handlers", namespace: "handlers" } );
                        //await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/2D.overlay", namespace: "overlay", arguments: { scene: scene } } );  
                        //await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/2D.icons.shapes", namespace: "shapes", arguments: { scene: scene } } );
                        //await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/2D.icons.views", namespace: "views" } );
                        
                            popup.hide();

                        loaded = true;
                    }
                    

                };

                return scene;   
            },

            databases: async function()
            {
                let scene = this;

                /*async function openDB()
                {
                    let tables = Array.from( t2.db.db.objectStoreNames );

                    let menu = await t2.ui.addComponent( { id: "tables", component: "menu", parent: t2.ui.elements.get( "menu" ), array: tables, horizontal: false } );
                        menu.addListener( { type: "click", handler: async ( e ) => 
                        { 
                            let table = e.target.textContent;
                            let container = await t2.ui.addComponent( { id: "dump", title: `${ table } Dump`, component: "container", parent: t2.ui.elements.get( "content" ), module: module } );
                            let data = await t2.db.tx.retrieve( table );
                            let list = await t2.ui.addComponent( { id: "data", component: "table", parent: container.element } );
                                //list.allColumns( { array: data.data } );
                                console.log( data );
                        } 
                    } ); 
                } */

                scene.pre = async () =>
                {
                    await t2.ui.addElement( { id: "menu", parent: t2.ui.children.get( "wrapper" ).element } );
                    await t2.ui.addElement( { id: "submenu", parent: t2.ui.children.get( "menu" ).element, ignore: "clear" } );
                    await t2.ui.addElement( { id: "middle", parent: t2.ui.children.get( "wrapper" ).element } );
                    await t2.ui.addElement( { id: "content", parent: t2.ui.children.get( "middle" ).element } );

                    await scene.addUnload( { namespace: "this", execute: "reset", arguments: [] } ); 

                    await scene.addModule( { default: "default", invoke: "init", path: "../projects/databases/databases", namespace: "databases" } );
                    /*await scene.addElement( { id: "menu", parent: "wrapper" } );
                    let submenu = await scene.addElement( { id: "submenu", parent: "menu", ignore: "clear" } );
                    await scene.addElement( { id: "middle", parent: "wrapper" } );
                    let content = await scene.addElement( { id: "content", parent: "middle" } );
                        content.style.display = "block";

                    let dbv = `${ t2.db.name } v${ t2.db.version }`;

                    submenu.textContent = t2.db.version ? dbv : "CLOSED";

                    if ( t2.db.version )
                        openDB();*/
                };

                scene.post = async () =>
                {
                    /*let open = await scene.addModule( { default: "default", invoke: "init", path: "../projects/databases/idb.form.open", namespace: "idb.open" } );
                        open.addListener( { type: "", handler: openDB } );

                    await scene.addModule( { default: "default", invoke: "init", path: "../projects/databases/idb.form.table", namespace: "idb.table" } );

                    await scene.addModule( { default: "default", invoke: "init", path: "../projects/databases/idb.form.export", namespace: "idb.export" } );

                    await scene.addModule( { default: "default", invoke: "init", path: "../projects/databases/idb.form.import", namespace: "idb.import" } );*/
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

            imports: async function()
            {
                let scene = this;
                let input;

                scene.pre = async () =>
                {
                    await scene.addElement( { id: "menu", parent: "wrapper" } );
                    let submenu = await scene.addElement( { id: "submenu", parent: "menu", ignore: "clear" } );
                    await scene.addElement( { id: "middle", parent: "wrapper" } );
                    let content = await scene.addElement( { id: "content", parent: "middle" } );
                        content.style.justifyContent = "start";

                    input = t2.common.el( "div", content );
                    input.id = "input";
                    input.classList.add( "input" );
                    input.setAttribute( "contenteditable", "" );
                    input.setAttribute( "data-ignore", "clear" );
                    input.addEventListener( "paste", function( e )  
                    {
                        // cancel paste
                        e.preventDefault();
                    
                        // get text representation of clipboard
                        var text = e.clipboardData.getData( 'text/plain' );

                        // insert text manually
                        document.execCommand( "insertHTML", false, text );
                    } );

                    let dbv = `${ t2.db.name } v${ t2.db.version }`;

                    submenu.textContent = t2.db.version ? dbv : "CLOSED";
                };

                scene.post = async () =>
                {
                    let f = new Save();
                        f.init();
                    let output;
                    
                    let forms = await scene.addModule( { default: "default", invoke: "read", path: "../projects/trades/trades.forms", namespace: "importer", arguments: { actions: [ "BUY", "SELL" ] } } );
                    let importer = await scene.addModule( { default: "default", invoke: "init", path: "../projects/imports/trades.importer", namespace: "importer", arguments: { input: input, output: output } } );
                    let menu = await t2.ui.addComponent( { id: "brokerage", component: "menu", parent: t2.ui.elements.get( "menu" ), array: [ "TDAmeritrade", "Robinhood" ], horizontal: false } );
                        menu.addListener( { type: "click", handler: async ( e ) => 
                            { 
                                let brokerage = e.target.textContent;
                                let scrubbed = importer.scrub( brokerage );

                                output = await t2.ui.addComponent( { id: "scrubbed", component: "list", parent: content } );
                                output.invoke( forms.read );
                                output.populate( { array: scrubbed } );     
                                
                                f.set( output.array ); 
                            } 
                        } );      

                    function Save()
                    {
                        this.init = () =>
                        {
                            let div = t2.common.el( "div", t2.ui.elements.get( "menu" ) );
                                div.style.display = "flex";
                                div.style.padding = "2px 0 2px 10px";
                                div.setAttribute( "data-ignore", "clear" );
                            let form = t2.common.el( "form", div );
                                form.id = "importer";
                                form.onsubmit = f.submit;
                            let bool = t2.common.el( "input", div );
                                bool.name = "bool";
                                bool.type = "checkbox";
                                bool.setAttribute( "Form", form.id );
                            let table = t2.common.el( "input", div );
                                table.name = "table";
                                table.placeholder = "table";
                                table.setAttribute( "size", 10 );
                                table.setAttribute( "Form", form.id );
                                table.setAttribute( "required", "" );
                            let submit = t2.common.el( "input", div );
                                submit.value = "Add";
                                submit.type = "submit";
                                submit.setAttribute( "Form", form.id ); 
                        };
        
                        this.set = ( array ) => this.array = array;

                        this.submit = async ( e ) =>
                        {
                            e.preventDefault();

                            let data = {};
                            let formData = new FormData( e.target );
                            let keys = Array.from( formData.keys() );
                                keys.forEach( key => data[ key ] = formData.get( key ) );

                            await importer.save( data.table, output.array, !!data.bool );

                            input.textContent = null;
                            t2.common.clear( [ "content" ] );
                        };
                    };
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
                    await scene.addElement( { id: "menu", parent: "wrapper" } );
                    await scene.addElement( { id: "submenu", parent: "menu" } );
                    await scene.addElement( { id: "middle", parent: "wrapper" } );
                    await scene.addElement( { id: "subcontent", parent: "middle" } );
                    await scene.addElement( { id: "margin", parent: "wrapper" } );
                    await scene.addElement( { id: "submargin", parent: "margin" } );
                };

                scene.post = async () =>
                {
                    let svg = await scene.addModule( { default: "default", invoke: "init", path: "../modules/svg/svg", namespace: "svg" } );
                    
                    await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/scripts/icons.shapes", namespace: "svg" } );
                    await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/scripts/icons.views", namespace: "svg" } );
                    await scene.addModule( { default: "default", invoke: "init", path: "../projects/2D/scripts/popup.attributes", namespace: "svg", arguments: { svg: svg } } );
                    
                    let layer = await svg.addType( { name: "layer1", parent: t2.ui.elements.get( "middle" ), type: "layer" } );
                    /*let rect  = await svg.addType( { name: "rect", parent: layer.element, type: "rect" } );
                        rect.addAttribute( "width", 28 );
                        rect.addAttribute( "height", 28 );
                        rect.addAttribute( "x", 0 );
                        rect.addAttribute( "y", 0 );
                        rect.addStyle( { name: "fill", value: "gray" } );
                        rect.addStyle( { name: "stroke", value: "orange" } );
                        rect.setStyle();*/

                    


                    /*let circle = await svg.addType( { name: "circle", parent: layer.element, type: "circle" } );
                        circle.addAttribute( "r", 14 );
                        circle.addAttribute( "cx", 14 );
                        circle.addAttribute( "cy", 50 );
                        circle.addStyle( { name: "stroke-width", value: 3 } );
                        circle.setStyle();*/


                    
                };

                return scene;       
            },

            trades: async function()
            {
                let scene = this;
                
                scene.pre = async () => 
                { 
                    await t2.ui.addElement( { id: "menu", parent: t2.ui.children.get( "wrapper" ).element } );
                    await t2.ui.addElement( { id: "submenu", parent: t2.ui.children.get( "menu" ).element, ignore: "clear" } );
                    await t2.ui.addElement( { id: "middle", parent: t2.ui.children.get( "wrapper" ).element } );
                    await t2.ui.addElement( { id: "content", parent: t2.ui.children.get( "middle" ).element } );
                    await t2.ui.addElement( { id: "subcontent", parent: t2.ui.children.get( "middle" ).element, ignore: "clear" } );
                    await t2.ui.addElement( { id: "margin", parent: t2.ui.children.get( "wrapper" ).element } );
                    await t2.ui.addElement( { id: "submargin", parent: t2.ui.children.get( "margin" ).element, ignore: "clear" } );

                    await scene.addUnload( { namespace: "this", execute: "reset", arguments: [] } );   

                    await scene.addModule( { default: "default", invoke: "init", path: "../projects/trades/trades", namespace: "trades" } );
                };

                scene.post = async () =>
                {
                    
                };

                return scene;
            },
        };
    };
};

export default Scripts;