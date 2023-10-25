const Template = function( module )
{
    this.init = async () => 
    {
        const parent = t2.ui.children.get( "content" );
        
        /*let menu = await t2.widget.create( { id: "menu", type: "menu" } );  
            menu.action.attach( t2.ui.children.get( "content" ) );
            // very important 
            menu.data.refresh = async () => menu.data.set( [ { id: 0, name: "zero" }, { id: 1, name: "one" }, { id: 2, name: "two" }, { id: 3, name: "three" }, { id: 4, name: "four" } ] );//await menu.data.get( "projects" );
            menu.data.sort( "id", "desc" );
            menu.display.set(
            { 
                label: { value: "id", text: "name", format: "capitalize" },
                orientation: "vertical",
                type: "link"
            } );
            await menu.init();

        let carousel = await t2.widget.create( { id: "carousel", type: "carousel" } );  
            carousel.action.attach( t2.ui.children.get( "content" ) );
            // very important 
            carousel.data.refresh = async () => await carousel.data.share( menu );
            carousel.event.subscribe( { type: "activate", broadcaster: menu, handler: ( packet ) => carousel.handlers.rotate( packet ) } );
            carousel.display.set(
            { 
                orientation: "vertical"
            } );
            await carousel.init();
        
        menu.handlers.activate( { text: "one" } );
        menu.handlers.disable( { index: 4 } );
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

        let meter = await t2.widget.create( { id: "meter", type: "meter" } );
            meter.action.attach( parent );
            meter.data.refresh = async () => await meter.data.get( "deposits" );
            meter.display.set(
            { 
                label: { value: "amount", format: "auto" },
                orientation: "horizontal",
                //type: "button"
                size: { height: "32px", width: "400px" },

            } );
            await meter.init();

        console.log( meter );
    }; 

};

export default Template;