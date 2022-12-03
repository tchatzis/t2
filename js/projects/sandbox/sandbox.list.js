const Component = function( module )
{
    let self = this;
    let wrapper = t2.ui.children.get( "wrapper" );
    
    this.init = function()
    {
        console.log( self.info )
    };

    this.run = async function()
    {
        let box2 = await wrapper.addContainer( { id: "segments", type: "box", format: "block", output: null } );

        let segments = await box2.addComponent( { id: "segments", type: "list", format: "flex" } );
            segments.addColumn( { 
                input: { name: "x", type: "number", step: 0.1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [ "number" ] } );
            segments.addColumn( { 
                input: { name: "y", type: "number", step: 0.1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [ "number" ] } );
            segments.addColumn( { 
                input: { name: "z", type: "number", step: 0.1, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [ "number" ] } );
            segments.addColumn( { 
                input: { name: "add", type: "submit", value: "ADD" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [] } );
            segments.addColumn( { 
                input: { name: "delete", type: "submit", value: "DELETE" }, 
                cell: { css: {}, display: 4, modes: [ "read", "edit" ] },
                format: [] } );
            segments.setColumns();
    };
};

export default Component;