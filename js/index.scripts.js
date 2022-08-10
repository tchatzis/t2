const Scripts = function()
{
    this.init = async () => 
    {
        return {
            [ "2D" ]: async function()
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

            databases: async function()
            {
                let scene = this;

                async function openDB()
                {
                    let tables = Array.from( t2.db.db.objectStoreNames );

                    let menu = await t2.ui.addComponent( { id: "tables", component: "menu", parent: t2.ui.elements.get( "menu" ), array: tables, horizontal: false } );
                        menu.addListener( { type: "click", handler: async ( e ) => 
                            { 
                                let div = t2.common.el( "div", t2.ui.elements.get( "content" ) );
                                    div.classList.add( "hform" );

                                let table = e.target.textContent;

                                let data = await t2.db.tx.retrieve( table );
                                let list = await t2.ui.addComponent( { id: "data", component: "list", parent: div } );
                                    list.invoke( ( params ) =>
                                    {
                                        params.parent.classList.add( "outline" );
                                        
                                        for ( let key in params.item )
                                        {
                                            let value = params.item[ key ];
                                            let cell = t2.common.el( "div", params.parent );
                                                cell.title = key;
                                                cell.classList.add( "data" );
                                                cell.textContent = ( typeof value == "object" ) ? `{ ${ key } }`: value;
                                        }
                                    } ); 
                                    list.populate( { array: data.data } );
                            } 
                        } ); 
                } 

                scene.pre = async () =>
                {
                    await scene.addElement( { id: "menu", parent: "wrapper" } );
                    let submenu = await scene.addElement( { id: "submenu", parent: "menu", ignore: "clear" } );
                    await scene.addElement( { id: "middle", parent: "wrapper" } );
                    let content = await scene.addElement( { id: "content", parent: "middle" } );
                        content.style.display = "block";

                    let dbv = `${ t2.db.name } v${ t2.db.version }`;

                    submenu.textContent = t2.db.version ? dbv : "CLOSED";

                    if ( t2.db.version )
                        openDB();
                };

                scene.post = async () =>
                {
                    let open = await scene.addModule( { default: "default", invoke: "init", path: "../projects/databases/idb.form.open", namespace: "idb.open" } );
                        open.addListener( { type: "", handler: openDB } );

                    await scene.addModule( { default: "default", invoke: "init", path: "../projects/databases/idb.form.table", namespace: "idb.table" } );

                    await scene.addModule( { default: "default", invoke: "init", path: "../projects/databases/idb.form.export", namespace: "idb.export" } );

                    await scene.addModule( { default: "default", invoke: "init", path: "../projects/databases/idb.form.import", namespace: "idb.import" } );
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
                    await scene.addElement( { id: "menu", parent: "wrapper" } );
                    await scene.addElement( { id: "submenu", parent: "menu", ignore: "clear" } );
                    await scene.addElement( { id: "middle", parent: "wrapper" } );
                    await scene.addElement( { id: "content", parent: "middle" } );
                    await scene.addElement( { id: "subcontent", parent: "middle", ignore: "clear" } );
                    await scene.addElement( { id: "margin", parent: "wrapper" } );
                    await scene.addElement( { id: "submargin", parent: "margin", ignore: "clear" } );
                    await scene.addUnload( { namespace: "this", execute: "reset", arguments: [] } );   

                    // menu links
                    let module = await scene.addModule( { default: "default", invoke: "init", path: "../projects/trades/trades", namespace: "trades" } );
                    let menu = await t2.ui.addComponent( { id: "symbols", component: "menu", parent: t2.ui.elements.get( "menu" ), array: module.data.symbol, horizontal: false } );
                        menu.addListener( { type: "click", handler: function() { module.clicked( ...arguments ) } } );  

                    let view = await t2.ui.addComponent( { id: "views", component: "menu", parent: t2.ui.elements.get( "header" ), array: module.views, horizontal: true } );
                        view.addListener( { type: "click", handler: function() { module.change( ...arguments ) } } );   
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