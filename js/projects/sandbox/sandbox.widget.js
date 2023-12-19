const Template = function( module )
{
    this.init = async () => 
    {
        const parent = t2.ui.children.get( "content" );
        const root = await t2.widget.create( { widget: "convert", parent: parent } );
            root.element.style.gap = "1em";

        const data =
        {
            // primitive
            0: () => "test", 
            // array
            1: () => [ "one", "two", "three", "four" ], 
            2: () => [ { id: 0, name: "zero" }, { id: 1, name: "one" }, { id: 2, name: "two" }, { id: 3, name: "three" }, { id: 4, name: "four" }, { id: 5, name: "five" } ],
            3: () => accordion.get.collection( "deposits" ),
            // object
            4: { one: 1, two: 2, three: 3, four: 4 },
            5: { a: { key: 1, name: "hundred", value: 100 }, b: { key: 2, name: "twohunny", value: 200 } }
        };
        
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

        /*
        
        menu.set.active( menu.get.widget.by.id( 3 ) );*/

        /*const knob = document.createElement( "div" );
            knob.style.borderRadius = "50%";
            knob.style.borderBottomLeftRadius = "2%";
            knob.style.border = "1px solid silver";
            knob.style.height = "10em";
            knob.style.width = knob.style.height;

        root.element.appendChild( knob );



        const bubble = document.createElement( "div" );
            bubble.style.backgroundColor = "#FFFFCC";
            bubble.style.borderRadius = "2em";
            bubble.style.borderBottomLeftRadius = "2%";
            //bubble.style.border = "1em solid silver";
            bubble.style.height = "10em";
            bubble.style.width = "20em";

        root.element.appendChild( bubble );*/


        let menu = await root.add.widget( { id: "menu", widget: "menu" } ); 
            menu.add.column( { key: "name", display: true, format: "capitalize", classes: [ "link" ], primaryKey: true } );
            //menu.add.column( { key: "id", display: false, format: "none", classes: [ "tab" ] } );
            menu.set.config( "orientation", "vertical" );
            menu.set.config( "primaryKey", "name" );
            // data
            await menu.set.datasource( data[ 2 ] );
            // draw
            await menu.render();
            // link stuff
            //menu.set.disabled( menu.get.widget.by.index( 4 ) ); 

        let expand = await root.add.widget( { id: "expand", widget: "expand" } );
            expand.set.config( "orientation", "horizontal" );
            expand.set.config( "primaryKey", "name" );
            // data
            await expand.set.datasource( menu.refresh );
            // draw
            await expand.render();
            // events
            expand.event.receive( { channel: [ "activate", "select" ], source: menu, handler: expand.set.active } );

        let accordion = await root.add.widget( { id: "accordion", widget: "accordion" } );
            accordion.set.config( "orientation", "vertical" );
            accordion.set.config( "primaryKey", "name" );
            // data
            await accordion.set.datasource( menu.refresh );
            // draw
            await accordion.render();
            // events
            accordion.event.receive( { channel: [ "activate", "select" ], source: menu, handler: accordion.set.active } );


        return;

        let panels = await root.add.widget( { id: "panels", widget: "panels" } );
            panels.set.config( "orientation", "horizontal" );
            panels.set.config( "primaryKey", "name" );
            // data
            await panels.set.datasource( menu.refresh );
            // draw
            await panels.render();
            // events
            panels.event.receive( { channel: [ "activate", "select" ], source: menu, handler: panels.set.active } );       

        let carousel = await root.add.widget( { id: "carousel", widget: "carousel" } );  
            carousel.set.config( "orientation", "vertical" );
            carousel.set.config( "primaryKey", "name" );
            // data
            await carousel.set.datasource( menu.refresh );
            // draw
            await carousel.render();
            // events
            carousel.event.receive( { channel: [ "activate", "select" ], source: menu, handler: carousel.set.active } );

        return;

        let receiver =  await root.add.widget( { id: "receiver", widget: "receiver" } );
            receiver.event.receive( { channel: [ "activate", "select" ], source: menu, handler: receiver.add.log } );
            await receiver.render();
    }; 
};

export default Template;