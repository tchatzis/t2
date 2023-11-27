const Template = function( module )
{
    this.init = async () => 
    {
        const parent = t2.ui.children.get( "content" );
        const root = await t2.widget.create( { widget: "convert", parent: parent } );
        
        /* 

        menu.handlers.flag( { display: "Three", css: "open" } );

        let multi = await t2.widget.create( { id: "multi", type: "multi" } );  
            multi.action.attach( t2.ui.children.get( "content" ) );
            // very important 
            multi.data.refresh = async () => multi.data.set( [ { id: 0, name: "zero" }, { id: 1, name: "one" }, { id: 2, name: "two" }, { id: 3, name: "three" }, { id: 4, name: "four" } ] );
            multi.data.sort( "id", "desc" );
            multi.display.set(
            { 
                label: { value: "id", text: "name", format: "capitalize" },
                orientation: "horizontal",
                type: "button"
            } );
            await multi.init();*/

        /*let meter = await t2.widget.create( { id: "meter", type: "meter" } );
            meter.action.attach( parent );
            meter.data.refresh = async () => await meter.data.get( "deposits" );
            meter.display.set(
            { 
                label: { value: "amount", format: "auto" },
                orientation: "horizontal",
                type: "bar",
                size: { height: "32px", width: "400px" },

            } );
            await meter.init();

        console.log( meter );*/

        

        /*let menu = await root.add.widget( { id: "menu", widget: "menu" } ); 
            menu.add.column( { key: "name", display: true, format: "capitalize", classes: [ "link" ], primaryKey: true } );
            menu.add.column( { key: "id", display: false, format: "none", classes: [ "tab" ] } );
            menu.set.config( "orientation", "horizontal" );
            // data
            await menu.set.source( () => [ { id: 0, name: "zero" }, { id: 1, name: "one" }, { id: 2, name: "two" }, { id: 3, name: "three" }, { id: 4, name: "four" } ] );
            // draw
            await menu.render();
            // link stuff
            menu.set.disabled( menu.get.widget.by.id( 4 ) );*/   
                 

        /*let table = await root.add.widget( { id: "table", widget: "table" } );
            // schema
            table.add.column( { key: "id", display: false, format: "none", mode: [ "read" ], type: Number, primaryKey: true } );
            table.add.column( { key: "datetime", display: true, format: "date&time", mode: [ "read", "write" ], type: Date, classes: [ "date" ], sort: "desc", validate: { content: "blur" } } );
            table.add.column( { key: "amount", display: true, format: "dollar", mode: [ "read" ], total: { calculation: "add" }, type: Number, classes: [ "number" ] } );
            table.add.column( { key: "brokerage", display: true, mode: [ "read" ], type: Array, classes: [ "flex" ], widget: "buttons", source: [ "JPMorganChase", "Robinhood", "TDAmeritrade" ] } );
            // data
            await table.set.source( () => table.get.collection( "deposits" ) );
            //table.set.filter( "id < 10" );

            // draw
            await table.render();
            // events
            table.event.receive( { channel: [ "activate", "select" ], source: menu, handler: ( e ) => table.set.highlight( { key: "id", value: e.detail.record.id } ) } );*/

        /*let carousel = await root.add.widget( { id: "carousel", widget: "carousel" } );  
            carousel.add.column( { key: "name", primaryKey: true } );    
            carousel.set.config( "orientation", "vertical" );
            // data
            await carousel.set.source( menu.refresh );
            // draw
            await carousel.render();
            // events
            carousel.event.receive( { channel: [ "activate", "select" ], source: menu, handler: carousel.handlers.rotate } );
        
        menu.set.active( menu.get.widget.by.id( 3 ) );*/

        let accordion = await root.add.widget( { id: "accordion", widget: "accordion" } );
            accordion.add.column( { key: "one", display: true, classes: [ "side" ], widget: "box" } );
            accordion.add.column( { key: "two", display: true, classes: [ "side" ], widget: "box" } );
            accordion.add.column( { key: "three", display: true, classes: [ "side" ], widget: "box" } );
            accordion.add.column( { key: "four", display: true, classes: [ "side" ], widget: "box" } );
            await accordion.render();
    }; 

};

export default Template;